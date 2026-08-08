.PHONY: tools golint test run

tools:
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

golint:
	golangci-lint run ./...

test:
	go test -v -race ./...
	
run:
	go run cmd/app/main.go --config=./config/config.yaml

tidy:
	go mod tidy
