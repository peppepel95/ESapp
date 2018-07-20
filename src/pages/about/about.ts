import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as h337 from 'heatmap.js/build/heatmap.js';
import { Service } from '../../app/service';

const DEFAULT_CONFIG = {
    radius: 10,
    maxOpacity: .5,
    minOpacity: 0,
    blur: .75
};

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage implements AfterViewInit {
  @ViewChild('heatmap', {read: ElementRef}) container;
  
  public heatmapInstance;
  private width: any;
  private height: any;
  public values: any;
  public config: any;
  public count = 0;
  public hideBt: boolean = false;
  public minutes: any;
  public hideText: boolean = false;
  public n = 0;
  public saved = 0;
  public StoredValues: any[] = [0, 0, 0, 0];
  public v: any[] = [];
  public StopIteration = 0;
  public showLab: boolean = false;
  
  constructor(public navCtrl: NavController, public service: Service) {
  }
  
  ngAfterViewInit() {
    let element = this.container.nativeElement;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;
    let width = element.offsetWidth;
    let height = element.offsetHeight;
    this.config = Object.assign({container: element}, DEFAULT_CONFIG, {width, height}, this.config);
    this.heatmapInstance = h337.create(this.config);
    let data = this.generateRandomData(this.height, this.width, [1,1,1,1]);
    this.heatmapInstance = this.heatmapInstance.setData(data);
    console.log(this.heatmapInstance);
  }
  
  generateRandomData(maxX, maxY, v): any{
      var max = 177;
      var min =  0;
      var data = [];
        data.push({
          x: ((0.25 * maxY) >> 0),
          y: ((0.20 * maxX) >> 0),
          value: ((parseFloat(v[0])) >> 0),  //color
          radius: 50  //raggio 
        });
        data.push({
          x: ((0.75 * maxY) >> 0),
          y: ((0.20 * maxX) >> 0),
          value: ((parseFloat(v[1])) >> 0),  //color
          radius: 50  //raggio 
        });
        data.push({
          x: ((0.25 * maxY) >> 0),
          y: ((0.55 * maxX) >> 0),
          value: ((parseFloat(v[2])) >> 0),  //color
          radius: 50  //raggio 
        });
        data.push({
          x: ((0.75 * maxY) >> 0),
          y: ((0.55 * maxX) >> 0),
          value: ((parseFloat(v[3])) >> 0),  //color
          radius: 50  //raggio 
        });
      return {
        max: max,
        min: min,
        data: data
      }
    };
  
  updateHeatmap(v): void {
    if (this.StopIteration == 0) {
      this.showLab = false;
      if (this.saved < this.n) {
        console.log("store");
        for (var i = 0; i < 4; ++i ) {
          this.StoredValues[i] = parseFloat(this.StoredValues[i]) + parseFloat(v[i]);
        }
        this.saved++;
        if (this.saved == this.n) {
          for (i = 0; i < 4; ++i ) {
            this.StoredValues[i] = this.StoredValues[i]/this.n;
          }
          let data = this.generateRandomData(this.height, this.width, this.StoredValues);
          this.heatmapInstance = this.heatmapInstance.setData(data);
          this.StopIteration = 100; //50*200 ovvero 10 secondi
          this.StoredValues = [0, 0, 0, 0]; //reset
        }
        else {
          let data = this.generateRandomData(this.height, this.width, v);
          this.heatmapInstance = this.heatmapInstance.setData(data);
        }
      }
      else {
        //heatmap
        let data = this.generateRandomData(this.height, this.width, v);
        this.heatmapInstance = this.heatmapInstance.setData(data);
      }
    }
    else {
      this.showLab = true;
      console.log(this.StopIteration);
      this.StopIteration--;
      if (this.StopIteration == 0) {
        this.hideText = true;
      }
    }
  }
  
  onClickLog(): void {
    this.hideBt = true;
    this.hideText = true;
    
    this.service.getObsValues().subscribe((val) => {
      //console.log(val);
      this.count++;
      if (this.count == 3) {
        this.count = 0;
        this.updateHeatmap(this.service.Values)
      }
    });
  }
  
  onSendMinutes(): void {
    console.log("timer settato");
    this.hideText = false;
    // conversione in millisecondi
    var milliseconds = this.minutes*60*1000;
    // calcolo del numero di iterazioni da salvare
    console.log(milliseconds);
    this.saved = 0;
    this.n = (milliseconds/200) >> 0;
    console.log(this.n);
    setTimeout(this.endTimer, milliseconds);
  }
  
  endTimer(): void {
    // media dei valori salvati
    console.log("end timer");
    this.n = 0;
  }
}

