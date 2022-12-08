import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistData } from '../../data/artist-data';
import { TrackData } from '../../data/track-data';
import { AlbumData } from '../../data/album-data';
import {SpotifyService} from '../../services/spotify.service';
import { PredictionEvent } from 'src/app/prediction-event';

@Component({
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  styleUrls: ['./album-page.component.css']
})
export class AlbumPageComponent implements OnInit {
	albumId:string;
	album:AlbumData;
	tracks:TrackData[];
  gesture: String = "";


  constructor(private route: ActivatedRoute, private spotifyService: SpotifyService) { }

  ngOnInit() {
  	this.albumId = this.route.snapshot.paramMap.get('id');
  	//TODO: inject spotifyService and use it to get the album data and the tracks for the album
    this.spotifyService.getAlbum(this.albumId).then((data) => {
      this.album = data; 
    });

    this.spotifyService.getTracksForAlbum(this.albumId).then((data) => { 
      this.tracks = data; 
    });
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
