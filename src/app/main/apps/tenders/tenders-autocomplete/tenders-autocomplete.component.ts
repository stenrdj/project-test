import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { TendersService } from '../tenders.service';

@Component({
  selector: 'app-tenders-autocomplete',
  templateUrl: './tenders-autocomplete.component.html',
  styleUrls: ['./tenders-autocomplete.component.scss']
})
export class TendersAutocompleteComponent implements OnInit {
  myControl = new FormControl('');
  form: FormGroup;
  options: any[] = [];
  filteredOptions: Observable<string[]>;
  @Output() search = new EventEmitter();
  constructor(private tenderService: TendersService, private fb: FormBuilder , private _fuseProgressBarService : FuseProgressBarService) { }
  ngOnInit() {
    this.form = this.fb.group({
      tender: this.myControl
    })

    this.tenderService.getTendersName().subscribe(res => {
      this.options = res;
      this.myControl.valueChanges
        .pipe(
          tap(()=> this._fuseProgressBarService.show()),
          startWith(''),
          debounceTime(2000),
          distinctUntilChanged()
        ).subscribe((val=>this.submit()));
    });
   }
  submit() {
    const name:string =  this.form.get('tender').value;
    const options = this.options.filter((x:any) => x.raw.toLowerCase().includes(name.toLowerCase()))
    this.search.next(options);
    this.search.subscribe((el)=>this._fuseProgressBarService.hide())
  } 
   

}
