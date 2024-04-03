import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { ScrumboardService } from 'app/main/apps/scrumboard/scrumboard.service';
import { result } from 'lodash';

@Component({
    selector     : 'scrumboard-label-selector',
    templateUrl  : './label-selector.component.html',
    styleUrls    : ['./label-selector.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class ScrumboardLabelSelectorComponent implements OnInit, OnDestroy
{
    @Input('card')
    card: any;

  

    board: any;
    labelsMenuView: string;
    selectedLabel: any;
    newLabel: any;
    toggleInArray: any;
 
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ScrumboardService} _scrumboardService
     */
    constructor(
        private _scrumboardService: ScrumboardService
    )
    {
        // Set the defaults
         this.labelsMenuView = 'labels';
        this.newLabel = {
            id   : '',
            name : '',
            color: 'green-400'
        };
        this.toggleInArray = FuseUtils.toggleInArray;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._scrumboardService.onBoardChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(board => {
                this.board = board;
            });
        console.log(this.card);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Card labels changed
     */
    onCardLabelsChanged(label): boolean
    {
        this._scrumboardService.updateLabel(label,this.card).then((result)=> console.log(result));
         return true;
    }

    /**
     * On label change
     */
    onLabelChange(): void
    {
    
    }

    /**
     * Add new label
     */
    addNewLabel(): void
    {
        const { id , ...newLabel} = this.newLabel;
        
        this._scrumboardService.creatNewLabel({...newLabel,cards:[{id:this.card.id}]}).subscribe((result)=>{
            this.board.labels.push(Object.assign({}, result));
            this.card.labels.push(Object.assign({}, result));

        });
       
        this.newLabel.name = '';
        this.labelsMenuView = 'labels';
     }
     
    /**
     * Check if label checked
     */
    isLabelChecked(label:any) : boolean
    {
        return label.cards.filter((item)=> this.card.id == item.id).length;
    }

}
