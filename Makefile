.PHONY: build run dev

# Build the Docker image
build:
	docker build -t histeeria-lite .

# Run the Docker container on port 8080
run:
	docker run -p 8080:80 histeeria-lite

# Run locally using PHP's built-in development server (if you don't want to use Docker)
dev:
	php -S localhost:8080 -t public/
