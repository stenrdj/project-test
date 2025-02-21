import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';

import { ScrumboardService } from 'app/main/apps/scrumboard/scrumboard.service';
import { Card } from 'app/main/apps/scrumboard/card.model';
import { ScrumboardCardDialogComponent } from 'app/main/apps/scrumboard/board/dialogs/card/card.component';
import { A } from '@angular/cdk/keycodes';
import * as moment from 'moment-timezone';

@Component({
    selector     : 'scrumboard-board-list',
    templateUrl  : './list.component.html',
    styleUrls    : ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ScrumboardBoardListComponent implements OnInit, OnDestroy
{
    board: any;
    dialogRef: any;
    listCardsIds:any = null;
    currentListCards:any = [];
    @Input()
    list;

    @ViewChild(FusePerfectScrollbarDirective)
    listScroll: FusePerfectScrollbarDirective;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {ScrumboardService} _scrumboardService
     * @param {MatDialog} _matDialog
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _scrumboardService: ScrumboardService,
        private _matDialog: MatDialog
    )
    {
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
                 
                this.board = JSON.parse(JSON.stringify(board)) ;

                this.currentListCards = this.board.cards.filter((card:any)=> card.kanbanlist_id == this.list.id).sort((a, b) =>  {
                      return moment(b?.tender?.deadline || new Date()).diff(a?.tender?.deadline || new Date(), 'minutes') > 0 && 1 || -1; 
                }); 

                 const soonDueCards:[] = this.currentListCards.filter((item)=>{
                    const daysRemaining = moment(new Date(item?.tender?.deadline)).diff(moment(), 'days');
                    return daysRemaining < 30 && daysRemaining > 0;
                 });
                 this.currentListCards = this.currentListCards.filter((item)=>{
                     return !soonDueCards.map((card:any)=> card.id).includes(item.id);
                 });
                 this.currentListCards = [...soonDueCards,...this.currentListCards];
                 
                 
            });
     }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.dialogRef?.close()
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On list name changed
     *
     * @param newListName
     */
    onListNameChanged(newListName): void
    {
        this.list.name = newListName;
        this._scrumboardService.updateList(newListName,this.list.id);
    }

    /**
     * On card added
     *
     * @param newCardName
     */
    onCardAdd(newCardName): void
    {
        if ( newCardName === '' )
        {
            return;
        }

        this._scrumboardService.addCard( {name: newCardName,kanbanlist_id:this.list.id,kanbanboard_id:this.board.id} ).subscribe();

        setTimeout(() => {
            this.listScroll.scrollToBottom(0, 400);
        });
    }

    /**
     * Remove list
     *
     * @param listId
     */
    removeList(listId): void
    {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete the list and it\'s all cards?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this._scrumboardService.removeList(listId).subscribe();
            }
        });
    }

    /**
     * Open card dialog
     *
     * @param cardId
     */
    openCardDialog(cardId): void
    {
         this.dialogRef = this._matDialog.open(ScrumboardCardDialogComponent, {
            panelClass: 'scrumboard-card-dialog',
            data      : {
                cardId: cardId,
                listId: this.list.id
            }
        });
        this.dialogRef.afterClosed()
            .subscribe(response => {

            });
    }

    /**
     * On drop
     *
     * @param ev
     */
    onDrop(ev): boolean
    {     
        this.listCardsIds = this.listCardsIds ?? this.currentListCards.map((card)=>card.id);
        console.log(this.listCardsIds);
        if(isNaN(ev.dropIndex) || isNaN(ev.value)) return false;
        const currentPosition  = ev.dropIndex;
        // Update the positions of the rest list cards
        this.listCardsIds.map((cardId,key)=>{
                if(key + 1 >= currentPosition - 2  && !!cardId){
                    this._scrumboardService.changeCardListPosition(cardId,this.list.id,this.listCardsIds.indexOf(cardId))

                }
        })

        return true;
 
     }
}
