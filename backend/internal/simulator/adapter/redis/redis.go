package redisdb

import (
	simulatordomain "antiscam-simulator/internal/simulator/domain"
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisDB struct {
	r   *redis.Client
	ttl time.Duration
}

func NewRedisDB(ttl int64, address string) *RedisDB {
	var opt *redis.Options
	if strings.HasPrefix(address, "redis://") || strings.HasPrefix(address, "rediss://") {
		var err error
		opt, err = redis.ParseURL(address)
		if err != nil {
			panic(err)
		}
	} else {
		opt = &redis.Options{
			Addr: address,
		}
	}

	return &RedisDB{
		r:   redis.NewClient(opt),
		ttl: time.Duration(ttl) * time.Minute,
	}
}

func (rdb *RedisDB) SetSession(ctx context.Context, sessionID string, session *simulatordomain.Session) error {

	sessionSlice, err := json.Marshal(session)
	if err != nil {
		return err
	}
	_, err = rdb.r.Set(ctx, sessionID, sessionSlice, time.Duration(rdb.ttl)).Result()

	if err != nil {
		return simulatordomain.ErrInternalStorage
	}

	return nil
}

func (rdb *RedisDB) GetSessionInfo(ctx context.Context, sessionID string) (*simulatordomain.Session, error) {

	sessionStr, err := rdb.r.Get(ctx, sessionID).Result()

	if err == redis.Nil {
		return nil, simulatordomain.ErrSessionNotFound
	} else if err != nil {
		return nil, simulatordomain.ErrInternalStorage
	}

	session := &simulatordomain.Session{}

	err = json.Unmarshal([]byte(sessionStr), session)
	if err != nil {
		return nil, err
	}
	return session, nil

}
