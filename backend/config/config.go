package config

import (
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	AppName  Application `yaml:"app"`
	HTTP     HTTPServer  `yaml:"http"`
	Cache    Cache       `yaml:"cache"`
	Redis    Redis       `yaml:"redis"`
	Database Database    `yaml:"db"`
	LLM      LLM         `yaml:"llm"`
}

type Database struct {
	DSN string `yaml:"dsn" env:"DB_DSN"`
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

type LLM struct {
	Key      string `yaml:"key" env:"YANDEX_KEY"`
	FolderID string `yaml:"folder_id" env:"YANDEX_FOLDER_ID"`
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
