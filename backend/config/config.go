package config

import (
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	AppName Application `yaml:"app"`
	HTTP    HTTPServer  `yaml:"http"`
	Cache   Cache       `yaml:"cache"`
	Redis   Redis       `yaml:"redis"`
}

type Application struct {
	Name string `yaml:"name" env:"APP_NAME"`
}

type HTTPServer struct {
	Address string `yaml:"address"  env:"HTTP_ADDRESS"`
}

type Cache struct {
	TTL int `yaml:"ttl" env:"TTL"`
}

type Redis struct {
	Address string `yaml:"address" env:"REDIS_ADDRESS"`
}

func MustLoad() *Config {

	configPath := os.Getenv("CONFIG_PATH")
	var cfg Config

	if configPath != "" {
		if err := cleanenv.ReadConfig(configPath, &cfg); err != nil {
			log.Fatalf("failed to read config: %s", err)
		}
	} else {
		if err := cleanenv.ReadEnv(&cfg); err != nil {
			log.Fatalf("failed to read env: %s", err)
		}
	}
	return &cfg
}
