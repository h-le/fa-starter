import {Component, OnInit} from '@angular/core';
import {SongService} from '../services/song.service';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css'],
})
export class SongComponent implements OnInit {
  song: any;

  constructor(private songService: SongService) {}

  ngOnInit() {
    this.getSong();
  }

  getSong(): void {
    this.songService.getSong().subscribe(song => {
      this.song = song;
    });
  }
}
