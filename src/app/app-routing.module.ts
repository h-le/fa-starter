import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SongComponent} from './song/song.component';

const routes: Routes = [
  {path: '**', redirectTo: '/'},
  {path: '', component: SongComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
