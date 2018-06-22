@echo off
set REDIS_STATUS=STOPPED
set REDIS_SERVER_PORT=6379
set NODE_SERVER_STATUS=STOPPED
set NODE_SERVER_PORT=81
set CURRENT_STEP=STATUS-REDIS



call:DO_TASK
echo.&pause&goto:eof

:DO_TASK
	
	if %REDIS_STATUS% == STOPPED (
		echo Checking redis server ....
		echo Redis server is stopped.
		echo Starting redis server ....
		call:START_REDIS_SERVER
		set REDIS_STATUS= STARTING
	)
	if %REDIS_STATUS% == STARTING (
		echo Redis server is starting.
		call:CHECK_STATUS_REDIS_SERVER
	)
	if %REDIS_STATUS% == STARTED  (
		echo Redis server is started.
	) 
	

	if %REDIS_STATUS% == STARTED (
		
		if %NODE_SERVER_STATUS% == STOPPED ( 
			echo Checking web server....
			echo Web server is stopped.
			echo Starting web server ....
			call:START_NODE_WEB_SERVER
			set NODE_SERVER_STATUS= STARTING
		) 
		
		if %NODE_SERVER_STATUS% == STARTING ( 
			echo Web server is starting.
			call:CHECK_STATUS_NODE_WEB_SERVER
		) 
		
		if %NODE_SERVER_STATUS% == STARTED (
			echo Web server is started.
		) 
	)
	
	if %REDIS_STATUS% == STARTED (
		if %NODE_SERVER_STATUS% == STARTED ( 
			echo "All are finished"
			pause
		) 
	)

call:DO_TASK
goto:eof

:CHECK_STATUS_REDIS_SERVER
	for /f "tokens=1-2,14" %%i in ('netstat -an ^| find "0.0.0.0:%REDIS_SERVER_PORT%"') do (
		if "%%j" == "0.0.0.0:%REDIS_SERVER_PORT%" (
			set REDIS_STATUS=STARTED
		) 
	)	
goto:eof

:START_REDIS_SERVER
	call start start-redis-server.bat
	echo waiting 2s to start redis-server 
	ping 127.0.0.1 -n 3 > nul
goto:eof

:START_NODE_WEB_SERVER
	call start node server.js
	echo waiting 5s to start web node-server 
	ping 127.0.0.1 -n 6 > nul
goto:eof

:CHECK_STATUS_NODE_WEB_SERVER
	for /f "tokens=1-2,14" %%i in ('netstat -an ^| find "0.0.0.0:%NODE_SERVER_PORT%"') do (
		if "%%j" == "0.0.0.0:%NODE_SERVER_PORT%" (
			set NODE_SERVER_STATUS=STARTED
		) 
	)	
goto:eof