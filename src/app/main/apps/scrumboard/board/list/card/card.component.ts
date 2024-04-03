import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment-timezone';

@Component({
    selector     : 'scrumboard-board-card',
    templateUrl  : './card.component.html',
    styleUrls    : ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ScrumboardBoardCardComponent implements OnInit
{
    @Input()
    cardId;
    moment: any = moment;
    card: any;
    board: any;
     /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     */
    constructor(
        private _activatedRoute: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.board = this._activatedRoute.snapshot.data.board;
        this.card =  this.board.cards.filter((card:any) => {
              return this.cardId === card.id;
        })[0];
        this.card.members = !this.card.members.length && this.card.author_id ? [{'id':this.card.author_id}] : this.card.members ;
        this.card['idMembers'] = this.card.members.map((elm)=>elm.id);
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Is the card overdue?
     *
     * @param cardDate
     * @returns {boolean}
     */
    isOverdue(cardDate): boolean
    {
        return moment() > moment(new Date(cardDate));
    }
    /**
     * Is the card overdue?
     *
     * @param cardDate
     * @returns {boolean}
     */
     isSoonOverdue(cardDate): boolean
    {   
        const daysRemaining = moment(new Date(cardDate)).diff(moment(), 'days');
        return daysRemaining < 30 && daysRemaining > 0;
    }

    isLabelChecked(label){
        return label.cards.filter((card)=>card.id ==  this.cardId ).length;
    }
}
