.PHONY: build up down
build:
	docker-compose up -d --build
up:
	docker-compose down --volumes && docker-compose up -d
down:
	docker-compose down