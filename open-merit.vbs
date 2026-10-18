' Starts Merit if it is not already running, then opens it in an Edge app window.
Set sh = CreateObject("Wscript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
app = fso.GetParentFolderName(WScript.ScriptFullName)
py = "C:\Users\johnq\AppData\Local\Programs\Python\Python312\python.exe"
edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
sh.CurrentDirectory = app

check = """" & py & """ -c ""import socket;s=socket.create_connection(('127.0.0.1',8765),1);s.close()"""
rc = sh.Run(check, 0, True)
If rc <> 0 Then
  sh.Run """" & py & """ -m http.server 8765 --bind 127.0.0.1", 0, False
  WScript.Sleep 1200
End If

sh.Run """" & edge & """ --app=http://127.0.0.1:8765/", 1, False
