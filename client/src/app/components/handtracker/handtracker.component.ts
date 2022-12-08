import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as handTrack from 'handtrackjs';
import { PredictionEvent } from 'src/app/prediction-event';
import { AppComponent } from 'src/app/app.component';
import { AboutComponent } from '../about/about.component';
import { SearchComponent } from '../search/search.component';
import { CarouselCardComponent } from '../carousel-card/carousel-card.component';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-handtracker',
  templateUrl: './handtracker.component.html',
  styleUrls: ['./handtracker.component.css']
})
export class HandtrackerComponent implements OnInit {
  @Output() onPrediction = new EventEmitter<PredictionEvent>();
  @ViewChild('htvideo') video: ElementRef;
  
  /* 
  SAMPLERATE determines the rate at which detection occurs (in milliseconds)
  500, or one half second is about right, but feel free to experiment with faster
  or slower rates
  */
  SAMPLERATE: number = 500; 

  appComponent: AppComponent; 
  aboutComponent: AboutComponent;
  searchComponent: SearchComponent;
  spotifyService: SpotifyService;
  carouselCardComponent: CarouselCardComponent;
  
  detectedGesture:string = "None"
  width:string = "400"
  height:string = "400"

  private model: any = null;
  private runInterval: any = null;

  //handTracker model
  private modelParams = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 20, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
  };

  constructor(appComponent: AppComponent) {
    this.appComponent = appComponent; 
    this.aboutComponent = new AboutComponent(this.spotifyService);
    this.searchComponent = new SearchComponent(this.spotifyService);
    this.carouselCardComponent = new CarouselCardComponent();
  }
  
  ngOnInit(): void{
    handTrack.load(this.modelParams).then((lmodel: any) =>{
        this.model = lmodel;
        console.log("loaded");
    });
  }

  ngOnDestroy(): void{
      this.model.dispose();
  }

  startVideo(): Promise<any> {
    return handTrack.startVideo(this.video.nativeElement).then(function(status: any){
        return status;
    }, (err: any) => { return err; }) 
  }

  startDetection(){
    this.startVideo().then(()=>{
        //The default size set in the library is 20px. Change here or use styling
        //to hide if video is not desired in UI.
        this.video.nativeElement.style.height = "200px"

        console.log("starting predictions");
        this.runInterval = setInterval(()=>{
            this.runDetection();
        }, this.SAMPLERATE);
    }, (err: any) => { console.log(err); });
  }

  stopDetection(){
    console.log("stopping predictions");
    clearInterval(this.runInterval);
    handTrack.stopVideo(this.video.nativeElement);
  }

  /*
    runDetection demonstrates how to capture predictions from the handTrack library.
    It is not feature complete! Feel free to change/modify/delete whatever you need
    to meet your desired set of interactions
  */
  runDetection(){
    if (this.model != null){
        let predictions = this.model.detect(this.video.nativeElement).then((predictions: any) => {
            if (predictions.length <= 0) return;
            
            let openhands = 0;
            let closedhands = 0;
            let pointing = 0;
            let pinching = 0;
            for(let p of predictions){
                //uncomment to view label and position data
                console.log(p.label + " at X: " + p.bbox[0] + ", Y: " + p.bbox[1] + " at X: " + p.bbox[2] + ", Y: " + p.bbox[3]);
                
                if(p.label == 'open') openhands++;
                if(p.label == 'closed') closedhands++;
                if(p.label == 'point') pointing++;
                if(p.label == 'pinch') pinching++;
                
            }

            // These are just a few options! What about one hand open and one hand closed!?
            // added additional conditionals for more accurate detection 

            // Gesture 1: Browsing Spotify
            if (openhands > 1 && closedhands == 0 && pinching == 0 && pointing == 0) {
              console.log("2 Open Hands");
              this.detectedGesture = "Two Open Hands";
              this.appComponent.home();
            }

            // Gesture 2: Log In
            else if(openhands == 1 && closedhands == 0 && pinching == 0 && pointing == 0) {
              console.log("Open Hand");
              this.appComponent.login();
              this.detectedGesture = "Open Hand";
            }
            
            // Gesture 3: Open Profile
            if (closedhands > 1 && openhands == 0 && pinching == 0 && pointing == 0) {
              console.log("Two Closed Hands");
              this.aboutComponent.openProfile();
              this.detectedGesture = "Two Closed Hands";
            }

            // Gesture 4: Load Info
            else if(closedhands == 1 && openhands == 0 && pinching == 0 && pointing == 0) {
              console.log("1 Closed Hand"); 
              this.aboutComponent.loadAboutMe();
              this.detectedGesture = "Closed Hand";
            }
            
            if (pointing > 1 && openhands == 0 && pinching == 0 && closedhands == 0) {
              this.detectedGesture = "Two Hands Pointing";
            }

            // Gesture 5: Search
            else if(pointing == 1 && closedhands == 0 && pinching == 0 && openhands == 0) {
              console.log("1 Pointed")
              this.searchComponent.getSearch();
              this.detectedGesture = "Hand Pointing";
            }

            // Custom Gesture 1: One Open Hand, One Hand Pointing
            if (openhands == 1 && pointing == 1 && pinching == 0 && closedhands == 0) {
              this.detectedGesture = "One Open Hand, One Hand Pointing";
            }
            
            // Customer Gesture 2: One Open Hand, One Closed Hand
            if (openhands == 1 && closedhands == 1 && pinching == 0 && pointing == 0) { 
              this.carouselCardComponent.directLocalPage();
              this.detectedGesture = "One Open Hand, One Closed Hand";
            }

            if (openhands == 0 && closedhands == 0 && pointing == 0 && pinching == 0) {
                this.detectedGesture = "None";
            }

            this.onPrediction.emit(new PredictionEvent(this.detectedGesture))
        }, (err: any) => {
            console.log("ERROR")
            console.log(err)
        });
    }else{
        console.log("no model")
    }
  }
}
