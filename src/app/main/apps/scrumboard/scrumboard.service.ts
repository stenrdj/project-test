import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin, throwError, of } from 'rxjs';
import { environment } from "../../../../environments/environment";
import { shareReplay } from 'rxjs/internal/operators/shareReplay';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { interval } from 'rxjs/internal/observable/interval';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, map, mergeMap , tap } from 'rxjs/operators';
 
@Injectable()
export class ScrumboardService implements Resolve<any>
{
    boards: any[];
    routeParams: any;
    board: any;

    onBoardsChanged: BehaviorSubject<any>;
    onBoardChanged: BehaviorSubject<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _snackBar: MatSnackBar
    ) {
        // Set the defaults
        this.onBoardsChanged = new BehaviorSubject([]);
        this.onBoardChanged = new BehaviorSubject([]);
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {
            Promise.all([

                this.getBoards()
            ]).then(
                () => {
                    resolve(1);
                },
                reject
            );
        });
    }

    /**
     * Get boards
     *
     * @returns {Promise<any>}
     */
    getBoards(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(environment.api + '/kanbanboard')
                .subscribe((response: any) => {
                    this.boards = response;
                    this.onBoardsChanged.next(this.boards);
                    resolve(this.boards);
                }, reject);
        });
    }

    /**
     * Get board
     *
     * @param boardId
     * @returns {Observable<any>}
     */
    getBoard(boardId): Observable<any> {
        const requests$ = [this._httpClient.get(environment.api + '/kanbanboard/' + boardId), this.getAllLabels(), this.getUsers()];
        return forkJoin(requests$).pipe(
            switchMap(([board, labels, users]: any) => {
                this.board = { ...board };
                this.board.cards = [];
                this.board.labels = labels.objects;
                this.board.members = users.objects;
                this.board.lists = this.board.lists.sort((a,b)=>a.name < b.name ? -1 : 0)
                if(board?.cards.length){
                    const cardsRequest$ = board.cards.filter((card) => !card?.deleted).map(card => this.getCard(card.id));
                    return forkJoin(cardsRequest$).pipe(
                        map(() => {
                            this.board.cards = this.board.cards;
                            this.onBoardChanged.next(this.board);
                            return this.board;
                        })
                    );
                }
                this.onBoardChanged.next(this.board);
                return of(true)
             }),
            catchError(err => {
                this._snackBar.open("A server error is occured ", null, {
                    duration: 8000,
                    panelClass: ['red-700-bg', 'white-fg']
                })
                return throwError(null);
            })
        )
    }

    /**
    * Add card
    *
    * @param cardId
    * @returns {Promise<any>}
    */
    getCard(cardId, options: { cardAsResponse: boolean } = { cardAsResponse: false }): Observable<any> {
        return this._httpClient.get(environment.api + '/kanbancard/' + cardId).pipe(
            map(card => {
                if (!this.board?.cards?.includes(card)) {
                    this.board?.cards?.push(card);
                }
                if (!options.cardAsResponse) {
                    return this.board
                }
                return card
            })
        )

    }

    /**
    * Update card
    *
    * @param cardId
    * @returns {Promise<any>}
    */
    updateCard(cardId, data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.board.cards =  this.board.cards.map((card:any) => {
                if(cardId=== card.id)
                    card.members = data.members
                return card;
             });
            this._httpClient.put(environment.api + '/kanbancard/' + cardId, data).subscribe((card: any) => {
                resolve(this.board);
            }, reject);
        });

    }

    /**
  * get All users
  *
  * @returns {Observable<any>}
  */
    getUsers(): Observable<any> {
        return this._httpClient.get(environment.api + '/user');

    }

    /**
     * Add card
     *
      * @param newCard
     * @returns {Observable<any>}
     */
    addCard(newCard): Observable<any> {

       
            return this._httpClient.post(environment.api + '/kanbancard', newCard).pipe(
                    tap((response)=>{
                        if (this.board?.cards.length)
                        this.board.cards.push(response);
                    else {
                        this.board = [];
                        this.board['cards'] = [];
                        this.board.cards.push(response);
                    }
                    this.onBoardChanged.next(this.board);
                })
            ) 
      

    }

    /**
     * Update List
     *
     * @param listName
     * @returns {Promise<any>}
     */
    updateList(listName, listId): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(environment.api + '/kanbanlist/' + listId, { name: listName })
                .subscribe(response => {
                    this.onBoardChanged.next(this.board);
                    this.board.lists = this.board.lists.sort((a,b)=>a.name < b.name ? -1 : 0)
                    resolve(this.board);
                }, reject);
        });



    }

    /**
     * Add list
     *
     * @param newList
     * @returns {Promise<any>}
     */
    addList(newList): Promise<any> {
        console.log(newList);
        return new Promise((resolve, reject) => {
            this._httpClient.post(environment.api + '/kanbanlist', newList)
                .subscribe(response => {
                    this.board.lists.push(response);
                    this.onBoardChanged.next(this.board);
                    this.board.lists = this.board.lists.sort((a,b)=>a.name < b.name ? -1 : 0)
                    resolve(this.board);
                }, reject);
        });



    }

    /**
     * Remove list
     *
     * @param listId
     * @returns {Observable<any>}
     */
    removeList(listId): Observable<any> {
      
        this.board.lists = this.board.lists.map((list)=>{
            if(listId == list.id)
                 list.deleted = true ;
            return list
        });
        this.onBoardChanged.next(this.board);
         
        return  this._httpClient.put(environment.api + '/kanbanlist/' + listId, { deleted: true })
        
         
    }

    /**
     * Remove card
     *
     * @param cardId
     * @param listId
     */
    removeCard(cardId): void {
        this.board.cards = this.board.cards.filter((_card) => {
            return _card.id != cardId;
        });

        new Promise((resolve, reject) => {
            this._httpClient.put(environment.api + '/kanbancard/' + cardId, { deleted: true }).subscribe((card: any) => {
                this.onBoardChanged.next(this.board);
                resolve(this.board);
            }, reject);

        });
    }
    /**
     * Change card Position Move card between lists
     *
     * @param cardId
     * @param listId
     * @param cardPosition
    */
    changeCardListPosition(cardId, listID, cardPosition): void {
        
        const cardsort = cardPosition > -1 ? cardPosition : 0;

        this.board.cards = this.board.cards.map((_card) => {
            if (_card.id === cardId) {
                _card.kanbanlist_id =listID;
                _card.sort_order = cardsort;
            }
            return _card;
        });
        this.onBoardChanged.next(this.board);

        this._httpClient.put(environment.api + '/kanbancard/' + cardId, { kanbanlist_id: listID, sort_order: cardsort })
                .pipe(
                    shareReplay({ bufferSize: 1, refCount: true })
                ).subscribe(response => {
        });
    }
    /**
     * Update board
     *
     * @returns {Promise<any>}
     */
    updateBoard(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(environment.api + '/kanbanboard/' + this.board.id, data)
                .subscribe(response => {
                    this.board = [];
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Update board
     *
     * @returns {Observable<any>}
     */
    removeBoard(): Observable<any> {
        const boardId =this.board.id;
        this.board = [];
        return  this._httpClient.put(environment.api + '/kanbanboard/' + boardId, {deleted:true})
         
    }

    /**
     * Create new board
     *
      * @returns {Promise<any>}
     */
    createNewBoard(): Promise<any> {
        return new Promise((resolve, reject) => {
            const board = { name: 'new Board', uri: Math.floor(Math.random() * 99999999) };
            this._httpClient.post(environment.api + '/kanbanboard', board)
                .subscribe(response => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * Get Labels List
     *
     * @returns {Observable<any>}
     */
    getAllLabels(): Observable<any> {
        return this._httpClient.get(environment.api + '/kanbanlabel');
    }

    /**
     * Create new Label
     *
     * @returns {Observable<any>}
     */
    creatNewLabel(label): Observable<any> {

        return this._httpClient.post(environment.api + '/kanbanlabel', label);
    }
    /**
    * Update Label
    *
    * @returns {Promise<any>}
    */
    updateLabel(label, card): Promise<any> {
        let labelData = Object.assign({}, label);
        let cardData = Object.assign({}, card);
        if (labelData.cards.filter((item) => item.id == cardData.id).length) {
            labelData.cards = labelData.cards.filter((item) => item.id != cardData.id);
        } else {
            labelData.cards.push({ id: cardData.id, kanbanboard_id: cardData.kanbanboard_id, kanbanlist_id: cardData.kanbanlist_id });
        }
        return new Promise((resolve, reject) => {


            this.board.labels = this.board.labels.map((item) => item.id == labelData.id ? labelData : item);

            this._httpClient.put(environment.api + '/kanbanlabel/' + labelData.id, labelData)
                .subscribe(response => {
                    this.onBoardChanged.next(this.board);
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Add new comment 
     *
     * @returns {Observable<any>}
     */
    addNewComment(comment): Observable<any> {
        
         return   this._httpClient.post(environment.api + "/comment", comment);
         
    }
}

@Injectable()
export class BoardResolve implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {ScrumboardService} _scrumboardService
     */
    constructor(
        private _scrumboardService: ScrumboardService
    ) {
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @returns {Promise<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this._scrumboardService.getBoard(route.paramMap.get('boardId'));
    }
}
