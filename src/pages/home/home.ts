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
              var str = stringa.join('');
              this.service.Values = str.split('-');
              console.log(str);
            };
            this.ble.startNotification(this.deviceIdble, "ffe0", "ffe1").subscribe(onRecive);
            });
        }
       });
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
}
