import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistData } from '../../data/artist-data';
import { TrackData } from '../../data/track-data';
import { AlbumData } from '../../data/album-data';
import { TrackFeature } from '../../data/track-feature';
import { SpotifyService } from 'src/app/services/spotify.service';
import { PredictionEvent } from 'src/app/prediction-event';

@Component({
  selector: 'app-track-page',
  templateUrl: './track-page.component.html',
  styleUrls: ['./track-page.component.css']
})
export class TrackPageComponent implements OnInit {
	trackId:string;
	track:TrackData;
  audioFeatures:TrackFeature[];
  gesture: String = "";

  constructor(private route: ActivatedRoute, private spotifyService:SpotifyService) { }

  ngOnInit() {
  	this.trackId = this.route.snapshot.paramMap.get('id');
  	//TODO: Inject the spotifyService and use it to get the track data and it's audio features
    this.spotifyService.getTrack(this.trackId).then((data) => {
      this.track = data; 
    });

    this.spotifyService.getAudioFeaturesForTrack(this.trackId).then((data) => {
      this.audioFeatures = data; 
    })
  }

  // instead of importing the page component with an activate route & spotify service to handtracker.component.ts,
  // the prediction function body is implemented 
  prediction(event: PredictionEvent) { 
    this.gesture = event.getPrediction();
    if (this.gesture == "One Open Hand, One Hand Pointing") { 
      let button = document.getElementsByClassName("btn btn-light")[0] as HTMLElement | null; 
      button.click();
    }
  }
}
