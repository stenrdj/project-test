import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';;

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseUtils } from '@fuse/utils';

import { ScrumboardService } from 'app/main/apps/scrumboard/scrumboard.service';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { DateAdapter } from '@angular/material/core';
import { formatComment,isEventComment } from 'app/helpers/tenderHelpers';
 
@Component({
    selector: 'scrumboard-board-card-dialog',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ScrumboardCardDialogComponent implements OnInit, OnDestroy {
    card: any;
    board: any;
    list: any;
    moment: any = moment;
    toggleInArray = FuseUtils.toggleInArray;
    formatComment = formatComment;
    isEventComment=isEventComment
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    @ViewChild('checklistMenuTrigger')
    checklistMenu: MatMenuTrigger;

    @ViewChild('newCheckListTitleField')
    newCheckListTitleField;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {MatDialogRef<ScrumboardCardDialogComponent>} matDialogRef
     * @param _data
     * @param {MatDialog} _matDialog
     * @param {ScrumboardService} _scrumboardService
     */
    constructor(
        public matDialogRef: MatDialogRef<ScrumboardCardDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _matDialog: MatDialog,
        private _scrumboardService: ScrumboardService,
        private _http: HttpClient) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._scrumboardService.onBoardChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(board => {
                console.log(board);
                this.board = board;
                this.card = this.board.cards.find((_card) => {
                    return this._data.cardId.id === _card.id;
                });

                this.card.members = !this.card.members.length && this.card.author_id ? [{'id':this.card.author_id}] : this.card.members ;
                this.card['idMembers'] = this.card.members.map((elm)=>elm.id);
                this.card['idLabels'] = [];
                this.list = this.board.lists.find((_list) => {
                    return this._data.listId === _list.id;
                });
                console.log(this.board);

            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.matDialogRef?.close()
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    isOverdue(cardDate): boolean {
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
    /**
     * Remove due date
     */
    removeDueDate(): void {
        this.card.due = '';

    }

    /**
     * Toggle subscribe
     */
    toggleSubscribe(): void {
        this.card.subscribed = !this.card.subscribed;


    }

    /**
     * Toggle cover image
     *
     * @param attachmentId
     */
    toggleCoverImage(attachmentId): void {
        if (this.card.idAttachmentCover === attachmentId) {
            this.card.idAttachmentCover = '';
        }
        else {
            this.card.idAttachmentCover = attachmentId;
        }

    }

    /**
     * Remove attachment
     *
     * @param attachment
     */
    removeAttachment(attachment): void {
        if (attachment.id === this.card.idAttachmentCover) {
            this.card.idAttachmentCover = '';
        }

        this.card.attachments.splice(this.card.attachments.indexOf(attachment), 1);

    }

    /**
     * Remove checklist
     *
     * @param checklist
     */
    removeChecklist(checklist): void {
        this.card.checklists.splice(this.card.checklists.indexOf(checklist), 1);

    }

    /**
     * Update checked count
     *
     * @param list
     */
    updateCheckedCount(list): void {
        const checkItems = list.checkItems;
        let checkedItems = 0;
        let allCheckedItems = 0;
        let allCheckItems = 0;

        for (const checkItem of checkItems) {
            if (checkItem.checked) {
                checkedItems++;
            }
        }

        list.checkItemsChecked = checkedItems;

        for (const item of this.card.checklists) {
            allCheckItems += item.checkItems.length;
            allCheckedItems += item.checkItemsChecked;
        }

        this.card.checkItems = allCheckItems;
        this.card.checkItemsChecked = allCheckedItems;

    }

    /**
     * Remove checklist item
     *
     * @param checkItem
     * @param checklist
     */
    removeChecklistItem(checkItem, checklist): void {
        checklist.checkItems.splice(checklist.checkItems.indexOf(checkItem), 1);

        this.updateCheckedCount(checklist);

    }

    /**
     * Add check item
     *
     * @param {NgForm} form
     * @param checkList
     */
    addCheckItem(form: NgForm, checkList): void {
        const checkItemVal = form.value.checkItem;

        if (!checkItemVal || checkItemVal === '') {
            return;
        }

        const newCheckItem = {
            name: checkItemVal,
            checked: false
        };

        checkList.checkItems.push(newCheckItem);

        this.updateCheckedCount(checkList);

        form.setValue({ checkItem: '' });

    }

    /**
     * Add checklist
     *
     * @param {NgForm} form
     */
    addChecklist(form: NgForm): void {
        this.card.checklists.push({
            id: FuseUtils.generateGUID(),
            name: form.value.checklistTitle,
            checkItemsChecked: 0,
            checkItems: []
        });

        form.setValue({ checklistTitle: '' });
        form.resetForm();
        this.checklistMenu.closeMenu();
    }

    /**
     * On checklist menu open
     */
    onChecklistMenuOpen(): void {
        setTimeout(() => {
            this.newCheckListTitleField.nativeElement.focus();
        });
    }

    /**
     * Add new comment
     *
     * @param {NgForm} form
     */
    addNewComment(form: NgForm): void {
        const newCommentText = form.value.newComment;

        const newComment = {
            text: newCommentText,
            creation_date: this.moment().tz("Europe/Berlin").format(),
            kanbancard_id: this.card.id
        };


        this._scrumboardService.addNewComment(newComment).subscribe((result) => {
            this.card.comments.unshift(newComment);

            form.setValue({ newComment: '' });
        })

    }

    /**
     * Remove card
     */
    removeCard(): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete the card?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.matDialogRef.close();
                this._scrumboardService.removeCard(this.card.id);
            }
        });
    }

    /**
     * Update card
     */
    updateCard(key: string): void {
         
        switch (key) {
            case 'name':
                this._scrumboardService.updateCard(this.card.id, { name: this.card.name });
                break;
            case 'desc':
                this._scrumboardService.updateCard(this.card.id, { description: this.card.description });
                break;
            case 'members':
                let members = []; 
                this.card.idMembers.forEach(element => {
                    members.push({"id":element})
                }); 
                this._scrumboardService.updateCard(this.card.id, { members: members });
                break;

            default:
                break;
        }

    }


}
