Set shell = CreateObject("Wscript.Shell")
localappdata = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%")
shell.Run "node """ & localappdata & "\Programs\antigravity\translate-launcher.js""", 0, False
