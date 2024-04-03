import { Component, OnDestroy, OnInit, ViewChild, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UploadFileService } from './upload-file.service';
import { Tender } from '../models/Tender';
import { MatStepper } from '@angular/material/stepper';
import { map, skipWhile, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ScrumboardService } from '../scrumboard/scrumboard.service';
import { CsvExportModule,ExcelExportModule , GridOptions, Module, RangeSelectionModule,ClipboardModule,ClientSideRowModelModule } from "@ag-grid-enterprise/all-modules";
import { LicenseManager } from '@ag-grid-enterprise/core';
 import {GridValidationToolTipComponent} from './components/grid-validation-tool-tip/grid-validation-tool-tip.component'
import { base64ToArrayBuffer } from 'app/helpers/tenderHelpers';
 
@Component({
    selector: 'upload-file',
    templateUrl: './upload-file.component.html',
    styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('stepper') private stepper: MatStepper;
    selectTenderMode: boolean = true;
    selectedFile: File;
    uploading: boolean;
    progress: number;
    uploadWithSuccess: boolean;
    errorMessage: string;
    uploadFile: any;
    colsFromFile: colsFromFileType = {raw:[],sorted:[]};
    colsFromFilePreview: any;
    colsFromFileNotMapped: string[] = [];
    templateConfig: any;
    preview: any[];
    tenderForm: FormGroup;
    fileForm: FormGroup;
    verticalStepperStep3: FormGroup;
    verticalStepperStep4: FormGroup;
    importConfigId: number;
    fileID: number;
    isFileValid: boolean = false;
    isValidating: boolean = false;
    buildFileResult: any = {};
    isFileDragged: boolean = false;
    tenderId: any;
    kanbanCardID: any;
    tenderName: string;
    tender:any;
    private destroy = new Subject();
    filteredtenders: Observable<string[]>;
    tendersList: any;
    isDownloadFileStarted: boolean = false;
    filePreviewResult: any = [];
    public gridOptions: GridOptions;
    public rowData: any[];
    public columnDefs: any[];
    modules: Module[] = [ClientSideRowModelModule,CsvExportModule,ExcelExportModule,RangeSelectionModule,ClipboardModule ];
    gridApi:any;
    private frameworkComponents;
    validation_grid:boolean = true;
    base64ToArrayBuffer=base64ToArrayBuffer;
    parseFloat = window.parseFloat;

    /**
     * Constructor
     *
     * @param {FormBuilder} fb
     */
    constructor(
        private fb: FormBuilder,
        private uploadFileService: UploadFileService,
        private renderer: Renderer2,
        private router: Router,
        private _scrumboardService: ScrumboardService
    ) {
        this.uploadFileService.getTenders().toPromise().then((results) => this.tendersList = results);
        if (this.router.getCurrentNavigation().extras.state) {
            this.tender=this.router.getCurrentNavigation().extras.state.tender;
            console.log("Tender created and send by state ",this.tender)
            this.tenderId = this.router.getCurrentNavigation().extras.state.id;
            this.tenderName = this.router.getCurrentNavigation().extras.state.name;
            this.kanbanCardID = this.router.getCurrentNavigation().extras.state.kanbancardId;
        }
        this.gridOptions = <GridOptions>{
            onGridReady: () => {
                var allColumnIds = [];
                this.gridOptions.columnApi.getAllColumns().forEach(function (column: any) {
                    allColumnIds.push(column.colId);
                });
                this.gridOptions.api.sizeColumnsToFit();
                this.gridOptions.columnApi.autoSizeColumns(allColumnIds, false);
            }
        };
        this.columnDefs = [];
        this.rowData = [];
        this.frameworkComponents = { customTooltip: GridValidationToolTipComponent };

    }
    ngOnInit(): void {
        LicenseManager.setLicenseKey('Engie_Engie_Deal_and_Risk_Management_BE_multi_1_Devs__21_January_2021_[v2]_MTYxMTE4NzIwMDAwMA==f61050fdb3e07532ffc3417cf516888c');
        this.initStepperForms();
        this.uploadFileService.getImportConfig().pipe(
            takeUntil(this.destroy)
        ).subscribe(res => this.templateConfig = res);
        this.filteredtenders = this.tenderForm.get('tender').valueChanges.pipe(
            startWith(''),
            map(value => {
                if (typeof value == 'string')
                    return this._filter(value);
                else if (typeof value == 'object') {
                    this.tenderForm.get('tender').setValue(value.name)
                    this.tenderId = value.id;
                    this.kanbanCardID = value?.kanbancard[0]?.id;
                    this.tender = value
                }

            })
        );
    }
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        if (!this.tendersList) return [];
        return this.tendersList.filter(option => option.name.toLowerCase().includes(filterValue));

    }
    ngOnDestroy(): void {
        this.destroy.next(true);
        this.destroy.complete();
    }
    ngAfterViewInit() {
        setTimeout(() => {
            if (this.tenderId && this.tenderName) {
                this.tenderForm.get('tender').setValue(this.tenderName);
             }
        }, 0);


    }



    goForward() {
        this.stepper.next();


    }
    onFileChanged(event) {
        this.isFileDragged = false;
        this.selectedFile = event.target.files[0];
        if (this.fileForm.valid)
            this.upload().then(()=> null);
    }
    dragFile(draggedFiles) {
        this.isFileDragged = true;
        this.selectedFile = draggedFiles[0];
        this.upload().then(()=> null);
    }
    upload(upload_file:File = null) {
        if(upload_file)
            this.selectedFile = upload_file;
        console.log(this.selectedFile);
        if (!this.selectedFile) return;
        this.uploading = true;
        const file = {
            file: null,
            filename: this.selectedFile.name,
            ImportConfiguration: '',
            tender_id: this.tenderId
        }
        return new Promise((resolve, reject) => {
            this.uploadFileService.uploadFile(this.selectedFile, file).pipe(
                takeUntil(this.destroy),
                tap(res => this.progress = res.progress),
                skipWhile(res => res.progress < 100),
                switchMap(res => {
                    this.uploading = false;
                    if (!!res?.response?.message) {
                        this.uploadWithSuccess = false;
                        this.errorMessage = res?.response?.message
    
                    } else {
                        this.uploadWithSuccess = true;
                        this.errorMessage = null;
                    }
    
                    this.fileID = res.response.id;
    
                    return forkJoin([this.uploadFileService.getColsFromUploadedFile(res.response.id), this.uploadFileService.getUploadedFile(res.response.id)]).pipe(
                        takeUntil(this.destroy)
                    )
                })
            ).subscribe((result:any) => {
                console.log(result)
                this.colsFromFile.raw = result[0][0]; 
                if(result[0].length >1)
                this.colsFromFile.raw.push(...result[0][1]);
                else
                this.colsFromFile.raw.push(...result[1].column_headers );

                this.uploadFile = result[1];
                this.importConfigId = this.uploadFile.import_config_id;
                let targetCategoriesPositions = [];
                Object.entries(this.uploadFile.import_config.config).map((cat, index) => {
    
                    targetCategoriesPositions.push("__disabled__");
                    Object.entries(cat[1]).map((attribute) => {
                        if (typeof attribute[1] == 'string')
                            targetCategoriesPositions.push(attribute[1])
                        else {
                            targetCategoriesPositions.push('__disabled__')
                            Object.entries(attribute[1]).map((att, index) => {
                                targetCategoriesPositions.push(att[1])
                            });
                        }
    
                    });
    
                });
                console.log(targetCategoriesPositions);
                this.colsFromFileNotMapped[0] = '__disabled__';
                this.colsFromFile.raw.map((item, index) => {
                    console.log(item)
                    targetCategoriesPositions.map((targetItem, targtIndex) => {
                        if (!targetCategoriesPositions.includes(item) && !targetItem) {
                            targetCategoriesPositions[targtIndex] = '';
                            if (!this.colsFromFileNotMapped.includes(item))
                                this.colsFromFileNotMapped.push(item);
    
                        }
                    })
    
                });
    
                this.colsFromFile.sorted = targetCategoriesPositions;   
                resolve(result);
            }, reject);
             
        });
       
    }

    importConfigurationOrSkip() {
        if(this.uploadWithSuccess)
            this.stepper.next();
        else{
                this.generateColsForGrid(null);
                setTimeout(() => {
                    this.stepper.linear = false;
                    this.stepper.selectedIndex=3;
                    this.stepper.linear = true;
                });
        }
           


    }
    saveConfiguration() {

        this.uploadFileService.setImportConfig(this.importConfigId, this.buildConfigObjectFromColsFile(this.colsFromFile.sorted)).pipe(
            takeUntil(this.destroy)
        ).subscribe(res => {
            this.stepper.next();
            this.nextToPreview();
            
        });



    }
    buildConfigObjectFromColsFile(array: string[]) {
        let object = { config: {} };
        let i = 0;
        Object.entries(this.uploadFile.import_config.config).map((cat, index) => {
            object.config[cat[0]] = {};
            i++;
            Object.entries(cat[1]).map((attribute, attributeIndex) => {
                if (typeof attribute[1] == 'string') {
                    object.config[cat[0]][attribute[0]] = array[i];
                    i++;
                }

                else {
                    object.config[cat[0]][attribute[0]] = {};
                    i++;
                    Object.entries(attribute[1]).map((att, attindex) => {
                        object.config[cat[0]][attribute[0]][att[0]] = array[i];
                        i++;
                    });
                }

            });

        });

        return object;
    }
    nextToPreview() {
        console.log(this.stepper);
        this.isValidating = true;
        document.querySelector('#container-3').scrollTop = 0;
        
        this.uploadFileService.checkFileValidationStatus(this.fileID)
            .then((response) => {
                console.log(response);
                
                    this.filePreviewResult = response.body; 
                    this.generateColsForGrid(response.body);
                    this.applyValidationOnGrid(response.body);
                    this.isValidating = false;
                if (response.status == 200) {
                    this.isFileValid = true;
                } else {
                    /* Validation faild */
                    this.isFileValid = false;
                     if(this.isThereAutofillValidationMessages())
                        setTimeout(()=>{
                            this.reValidateCSV();
                            
                        },50)
                        
                 }
            });

    }
    isThereAutofillValidationMessages(){
        return this.filePreviewResult?.validation?.filter(elm => elm.level == 35).length > 0 && this.filePreviewResult?.validation?.filter(elm => elm.level == 40).length == 0
    }
    buildAssets(){

        this.uploadFileService.triggerBuildUploadedValidatedFile(this.fileID).then((res) => {
            /* Start building */
             if (res.status == 504) {
                /*   building faild , the error will show up from the interceptor*/
                 
            } else {
                /*   building success*/ 
                this.buildFileResult = res;
                this.stepper.next();
                this._scrumboardService.addNewComment({ text: "__ASSETS_FILE_UPLOADED__", kanbancard_id: this.kanbanCardID }).subscribe((r)=>r);
                document.querySelector('#container-3').scrollTop = 0;

            }

        });
    }
    clearTenderForm() {
        this.tenderForm = this.fb.group({
            'tender': ['', Validators.required],
            'template': [''],
        });
        this.selectedFile = null;
    }
    private initStepperForms() {
        this.tenderForm = this.fb.group({
            'tender': ['', Validators.required],
            'template': [''],
        });

        this.fileForm = this.fb.group({
            'file': ['']
        });

        this.verticalStepperStep3 = this.fb.group({});
    }
    generateColsForGrid(validation_data:any) {
        let previewData = {cols:[],data:[]} ;
        if(validation_data)
              previewData = this.recursiveParsePreviewData(validation_data.data);
        else
            previewData.cols = ["Asset.name","Asset.cod","Asset.installed_capacity","ServicePoint.tso","ServicePoint.dso","ServicePoint.servicepoint_type","ServicePoint.servicepoint_code_type","Site.country","Site.name","Asset.description.§51 Park","Asset.description.Performance Ratio","Asset.description.Tracking Type","Asset.latitude","Asset.longitude","ServicePoint.name","AssetExtra.can_curtail","AssetExtra.manufacturer_sn","AssetExtra.total_renum_art_51","Site.latitude","Site.cipu","Site.longitude","Asset.gps_type","Site.owners","AssetExtra.has_night_curtailment","AssetExtra.night_curtailment_begin","AssetExtra.night_curtailment_end","AssetExtra.night_curtailment_max_capacity","AssetExtra.reference_yield","AssetExtra.total_renumeration","ServicePoint.localconso","ServicePoint.reference","ServicePoint.code","Machine.machine_type","Asset.hub_height","Asset.p50","Asset.rotor_diameter","AssetExtra.mean_active_hours","AssetExtra.max_control_value","Asset.description.Altitude","Asset.description.Azimuth","Asset.description.Tilt","Machine.name"];
        console.log(previewData);
         
        this.columnDefs = JSON.parse(previewData.cols.reduce((sum, elem, index) => {
            let val = '{"field":"' + this.string_to_slug(elem) + '","suppressSizeToFit": true,"resizable": true,"headerTooltip":"", "editable": true,"headerName":"'+elem+'"}';
            if (index == 0)
                return '['+val+',';
            if (index == previewData.cols.length - 1)
                return sum + val+']';

            return sum + val+',';
        }, ''));

        this.rowData = JSON.parse('[' + previewData.data.map((elem,key) => {
            
            return elem.reduce((sum, elm, index) => {
                let val = elm[1] == null ? '' : elm[1];
                if (index == 0)
                    return '{"' + this.string_to_slug(elm[0]) + '":"' + val + '",';
                if (index == elem.length - 1)
                    return sum + '"' +  this.string_to_slug(elm[0])+ '":"' + val + '"}';
                return sum + '"' +  this.string_to_slug(elm[0]) + '":"' + val + '",';
            }, '');


        }).join(',') + ']');
        
        
        [...Array(50)].map((item, i) =>{
            let row = this.columnDefs.map((elem)=>'"'+elem.field+'":""');
            this.rowData.push(JSON.parse("{"+row.join(',')+"}"));

        });
        this.gridOptions?.api?.setColumnDefs(this.columnDefs);

        console.log(this.columnDefs);
        console.log(this.rowData);

    }

    recursiveParsePreviewData(
        obj,
        path = '',
        cols = [],
        data = [],
        i = 0
    ) {
        return Object.entries(obj)
            .map((elm: any, key) => {
                let param = null;
                if (typeof elm[1] == 'object' && elm[1] != null) {
                    param = elm[0] == key ? '' : !!path ? path + '.' + elm[0] : elm[0];
                    this.recursiveParsePreviewData(elm[1], param, cols, data, i);
                } else {
                    cols.push(path + '.' + elm[0]);

                    if (data[i] == undefined) data[i] = new Array();
                    data[i].push([String(path + '.' + elm[0]), elm[1]]);
                }
                if (elm[0] == key) i++;
                if (key == obj.length - 1) return { cols: [...new Set(cols)], data };
            })
            .filter((o) => !!o)[0];
    }
    
    string_to_slug(str:string) {
        if(!str) return;

        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
      
        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
    
        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
    
        return str;
    } 
   
    applyValidationOnGrid(response: any) {
        this.columnDefs = this.columnDefs.map(function (colDef, index) {
            colDef.tooltipComponent= "customTooltip";
            colDef.tooltipValueGetter = (param) => {
                let m = response.validation.filter((message)=> {
   
                    return message.row -2 == param.rowIndex && this.string_to_slug( message.col_name) == this.string_to_slug( colDef.headerName)
                })
                if(m.length ) 
                    return { value:m[0].message  ,class:"message-level-"+m[0].level }

                return { value:null  ,class:null }
            };
            colDef.cellClass =  (param)=>{
           
                let m = response.validation.filter((message)=> message.row-2 == param.rowIndex && this.string_to_slug( message.col_name) == this.string_to_slug( colDef.headerName))
                if(m.length )
                    return "message-level-"+m[0].level

                return '';
            };
            colDef.headerClass = (param)=>{
                let m = response.validation.filter((message)=> message.row == 1 && this.string_to_slug( message.col_name) == this.string_to_slug( colDef.headerName))
                if(m.length )
                    return "message-level-"+m[0].level

                return '';
            }
            let m = response.validation.filter((message)=> message.row == 1 && this.string_to_slug( message.col_name) == this.string_to_slug( colDef.headerName))
            if(m.length )
                colDef.headerTooltip =  m[0].message ;
            else    
                colDef.headerTooltip = m.length;
            return colDef;
        }.bind(this));
        this.gridOptions?.api?.setColumnDefs(this.columnDefs);
    }

    reValidateCSV(){
        let blob;
        blob = new Blob([this.gridOptions.api.getDataAsCsv()], {type: 'text/csv'});
        this.isValidating = true;    
        this.upload(new File([blob], "Validation_file.csv")).then((r)=>{
            this.nextToPreview();
        }); 
         
    }
    isGridEmpty(){
        return this.gridOptions.api.getDataAsCsv({columnSeparator:'',skipHeader:true,skipGroups:true,suppressQuotes:true}).replace(',','').trim().length
    }

    exportAsExcelFile(){
        this.gridOptions.api.exportDataAsExcel({
            sheetName:"physical_description",
            fileName:"gepo_physical_description"
        });
    }
}
export interface colsFromFileType {
    raw:string[];
    sorted:string[];
  }
  