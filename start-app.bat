@echo off
set REDIS_STATUS=STOPPED
set REDIS_SERVER_PORT=6379
set NODE_SERVER_STATUS=STOPPED
set NODE_SERVER_PORT=80
set CHROME_PLUGIN_STATUS=STOPPED
set ALL_STATUS=PROCESSCING



call:DO_TASK
echo.&pause&goto:eof

:DO_TASK

	call:CHECK_STATUS_REDIS_SERVER
	call:CHECK_STATUS_NODE_WEB_SERVER
	call:CHECK_STATUS_CHROME_PLUGIN
		
	if %ALL_STATUS% == PROCESSCING (
		
		
		if %REDIS_STATUS% == STOPPED (
			echo Checking redis server ....
			echo Redis server is stopped.
			echo Starting redis server ....
			call:START_REDIS_SERVER
			set REDIS_STATUS= STARTING
		)
		if %REDIS_STATUS% == STARTING (
			echo Redis server is starting.
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
			) 
			
			if %NODE_SERVER_STATUS% == STARTED (
				echo Web server is started.
			) 
		)
		
		if %REDIS_STATUS% == STARTED (
			if %NODE_SERVER_STATUS% == STARTED ( 
				if %CHROME_PLUGIN_STATUS% == STOPPED ( 
					echo Checking chrome plugin....
					echo Chrome plugin is stopped.
					echo Starting Chrome plugin ....
					call:START_CHROME_PLUGIN
					set CHROME_PLUGIN_STATUS= STARTING
				)
				
				if %CHROME_PLUGIN_STATUS% == STARTING ( 
					echo Chrome plugin is starting.
				)
				
				if %CHROME_PLUGIN_STATUS% == STARTED (
					echo Chrome plugin is started.
					echo All tasks are completed. Enjoy watching movie on port 80!!!
					set ALL_STATUS= DONE
				) 
			) 
		)
	) else (
		call:DETECT_FOR_LIVE
	)
	

call:DO_TASK
goto:eof

:CHECK_STATUS_REDIS_SERVER
	set REDIS_STATUS=STOPPED
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
	set NODE_SERVER_STATUS=STOPPED
	for /f "tokens=1-2,14" %%i in ('netstat -an ^| find "0.0.0.0:%NODE_SERVER_PORT%"') do (
		if "%%j" == "0.0.0.0:%NODE_SERVER_PORT%" (
			set NODE_SERVER_STATUS=STARTED
		)
	)	
goto:eof

:START_CHROME_PLUGIN
	call start C:\Users\MyPC\AppData\Local\CocCoc\Browser\Application\browser.exe
	echo waiting 5s to start chrome
	ping 127.0.0.1 -n 6 > nul
goto:eof

:CHECK_STATUS_CHROME_PLUGIN
	tasklist /FI "IMAGENAME eq browser.exe" 2>NUL | find /I /N "browser.exe">NUL
	if "%ERRORLEVEL%"=="0" (
		set CHROME_PLUGIN_STATUS=STARTED
	) else (
		set CHROME_PLUGIN_STATUS=STOPPED
	) 
		
goto:eof

:DETECT_FOR_LIVE
	ping 127.0.0.1 -n 6 > nul
	echo Running background process of live.
	echo +++ NODE_SERVER_STATUS=%NODE_SERVER_STATUS%
	echo +++ REDIS_STATUS=%REDIS_STATUS%
	echo +++ CHROME_PLUGIN_STATUS=%CHROME_PLUGIN_STATUS%
	if %NODE_SERVER_STATUS%==STOPPED (
		call:RESET_ALL
	)
goto:eof

:RESET_ALL
	set ALL_STATUS=PROCESSCING
	echo Issue!!! ===> Kill and restart all tasks.
	taskkill /IM browser.exe /F
	taskkill /IM node.exe /F
	rem taskkill /IM redis-server.exe /F
goto:eof
