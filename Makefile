run:
	cd ./auth_service \
	node ./auth_service.js >./logs/auth_service & \
	cd .. \
	node ./app.js >./logs/main_service &
