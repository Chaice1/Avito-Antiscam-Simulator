.PHONY: build up down
build:
	docker-compose up -d --build
run:
	docker-compose down --volumes && docker-compose up -d
stop:
	docker-compose down

unit:
	make -C backend test