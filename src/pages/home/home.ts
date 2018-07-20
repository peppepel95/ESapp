import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Location } from '@angular/common';
import { Service } from '../../app/service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private devices: any;
  private conn: any;
  private deviceIdble = "D4:36:39:BC:13:19";
  private serviceUUID = "";
  private characteristicUUID = "";
  public characteristic = "";
  public msg = "";
  public name = "";
  public weight = "";
  public showInputHideProfile: boolean = true;
  public DEF_STR = "imagePosition/imageChair";
  public DEF_EXT = ".png";
  public image = "imagePosition/imageChair111.png";
  public str: string = "";
  public message1: string = "";
  public message2: string = "";
  public message3: string = "";
  public showImage: boolean = true;
  
  constructor(public navCtrl: NavController, private ble: BLE, private location: Location, private androidPermissions: AndroidPermissions, public service: Service) {
    androidPermissions.checkPermission(androidPermissions.PERMISSION.BLUETOOTH).then(
    success => {console.log('Permission granted');},
    err => androidPermissions.requestPermissions(androidPermissions.PERMISSION.BLUETOOTH)
    );
    androidPermissions.checkPermission(androidPermissions.PERMISSION.BLUETOOTH_ADMIN).then(
    success => {console.log('Permission granted');},
    err => androidPermissions.requestPermissions(androidPermissions.PERMISSION.BLUETOOTH_ADMIN)
    );
      this.devices = this.ble.startScan([]);
      console.log(this.devices);
      console.log('List of devices');
      this.devices.subscribe((data) => {
        console.log(data);
        console.log(JSON.stringify(data));
        console.log(data.id);
        if (data.id == this.deviceIdble) {
          console.log("trovato, stop scan");
           this.ble.stopScan();
           console.log("prova di connessione");
           this.conn = this.ble.connect(data.id);
           this.conn.subscribe((data) => {
            console.log(JSON.stringify(data));
            console.log("connesso");
            this.serviceUUID = data.services;
            this.characteristicUUID = data.characteristics;
            console.log(data.services);
            console.log(data.characteristics);
            var onRecive = (data) => {
              var stringa = new Array();
              var arrayInt = new Int8Array(data);
              for (var i = 0; i < arrayInt.length; ++i ) {
                stringa[i] = String.fromCharCode(arrayInt[i]);
              }
              // Gestione file json
              var temp_str = stringa.join('');
              //console.log(temp_str);
              if (this.str.startsWith('{') || temp_str.startsWith('{')) {
                this.str += temp_str;
                if (temp_str.endsWith("}")) {
                  var myJsonObj = JSON.parse(this.str);
                  this.service.Values = myJsonObj.ws;
                  this.updatePosition(myJsonObj.ps.join(''));
                  this.showMessage(myJsonObj.ps);
                  console.log(myJsonObj.ws.join('-'));
                  console.log(myJsonObj.ps.join(''));
                  this.str = "";
                }
              }
            };
            this.ble.startNotification(this.deviceIdble, "ffe0", "ffe1").subscribe(onRecive);
            });
        }
       });
      this.showMessage([1, 0, 0]);
  }
  
  onClickSend(): void {
    console.log(this.msg);
    var array = new Uint8Array(10);
    for (var i = 0; i < this.msg.length; ++i ) {
      array[i] = this.msg.charCodeAt(i);
      console.log(array[i]);
    }
    console.log(array.buffer);
    var onSuccess = (data) => {
      console.log(JSON.stringify(data));
      console.log("invio con successo");
    };
    var onError = (data) => {
      console.log(JSON.stringify(data));
      console.log("ops");
    };
    this.ble.write(this.deviceIdble, "ffe0", "ffe1", array.buffer).then(onSuccess).catch(onError);
  }

  onSaveProfile(): void {
    if (this.name != "" && this.weight != "")
      this.showInputHideProfile = false;
  }
  
  onModProfile(): void {
    this.showInputHideProfile = true;
  }
  
  updatePosition(position: string): void {
    var arrStr = [this.DEF_STR, position, this.DEF_EXT];
    this.image = arrStr.join('');
    console.log(this.image);
  }
  
  showMessage(position: any): void {
    var x = position[0], y = position[1], z = position[2];
    var msg1 = "", msg2 = "", msg3 = "";
    
    if (x == 0) {
      msg1 = "Sei seduto in modo scorretto!";
    }
    else if (x == 1) {
      msg1 = "Disponi meglio il tuo peso";
    }
    else {
      msg1 = "Continua così!";
    }
    if (y == 0) {
      msg2 = "Distendi le gambe";
    }
    if (z == 0) {
      msg3 = "Non poggiare la schiena";
    }
    this.message1 = msg1;
    this.message2 = msg2;
    this.message3 = msg3;
  }
  
  onChangeVisual(): void {
    this.showImage = !this.showImage;
  }
}
