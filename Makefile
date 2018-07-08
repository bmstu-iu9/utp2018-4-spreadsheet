dbup:
	sudo docker run -d -p 6370:6379 redis

all:
	node ./app/auth_service.js >./logs/auth_service & \
	node .app.js >./logs/main_service &

run: dbup, all
