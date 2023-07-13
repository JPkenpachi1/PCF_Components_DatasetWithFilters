import {IInputs, IOutputs} from "./generated/ManifestTypes";
import moment = require("moment");
// eslint-disable-next-line no-undef
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import "./css/datasetry4.css"

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class datasetry4 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private search: string;
    private context: ComponentFramework.Context<IInputs>;
    private notifyOutputChanged: () => void;
    private container: HTMLDivElement;
    private startDate: Date | null ;
   private endDate: Date | null ;
   private columname:string
 

    /**
     * Empty constructor.
     */
    constructor()
    {
        this.search = "";
        

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        this.container = container;
        container.style.margin='50px';
        this.columname=context.parameters.ColumnName.raw|| ''
        console.log(this.columname);
        
    
        

    
    }
    private handlechange(e: Event): void {
        const target = e.target as HTMLInputElement;
        this.search = target.value;
    
     
        this.renderTable();
       
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;
        this.columname=context.parameters.ColumnName.raw||'';
        this.renderTable();


    }
    public renderTable(): void {
        const dataset = this.context.parameters.sampleDataSet;
        if (!dataset.sortedRecordIds || !dataset.sortedRecordIds.length) {
            return;
        }
    
        this.container.innerHTML = "";
        const tableContainer = document.createElement("div");
        tableContainer.style.height = "500px"; // Set the height as required
        tableContainer.style.overflowY = "scroll"; // Enable vertical scrolling
        tableContainer.classList.add('tableContainer');
        const tableEl = document.createElement("table");
        tableEl.classList.add('table_t');

    
        // create table header row
        const headerRowEl = document.createElement("tr");
        headerRowEl.classList.add('headerow');
        dataset.columns.forEach(column => {
            const headerCellEl = document.createElement("th");
            headerCellEl.innerText = column.displayName;
            
            headerCellEl.classList.add('header');
            headerRowEl.appendChild(headerCellEl);
        });
        tableEl.appendChild(headerRowEl);
        
        let recordCount = 0; 

    
        dataset.sortedRecordIds.forEach((recordId) => {
          
           
            const record = dataset.records[recordId];
            //  const recordDate = new Date(record.getFormattedValue(jp));
            //  const recordDate = new Date(record.getFormattedValue(this.columname));
            const recordDate=new Date(record.getFormattedValue(this.columname));
                // Update the column name for the date type filter ...
            if ((this.startDate && recordDate < this.startDate) ||(this.endDate && recordDate > this.endDate)) {
                console.log(recordDate,'this is the record date ');
                return;
            }
            if (this.search && !this.recordMatchesSearch(record, dataset.columns)) {
                return;
            }
    
            const rowEl = document.createElement("tr");
                rowEl.classList.add('tbrw','fade-in');

            dataset.columns.forEach(column => {
                const cellEl = document.createElement("td");
                cellEl.innerText = record.getFormattedValue(column.name);
                cellEl.style.border = "1px solid #ffff";
                cellEl.style.padding = "8px";
                
            
                rowEl.appendChild(cellEl);
            });
             tableEl.appendChild(rowEl);
           
            recordCount++;
            setTimeout(() => {
                rowEl.classList.add('active');
            }, 0);
        });
        if (recordCount === 0) {
            const errorRowEl = document.createElement("tr");
            const errorCellEl = document.createElement("td");
            errorCellEl.classList.add('errorCell');
            errorCellEl.innerText = "No records found";
            errorCellEl.colSpan = dataset.columns.length; // Set the colSpan to the number of columns in the dataset
            errorCellEl.style.textAlign = "center";
            errorRowEl.appendChild(errorCellEl);
            tableEl.appendChild(errorRowEl);
        }

        
    const recordCountEl = document.createElement("span");
    recordCountEl.innerText = `Showing ${recordCount} records`;
    recordCountEl.id = "record-count";
    recordCountEl.style.fontSize = "1rem";
    recordCountEl.style.fontFamily = "segoeUi";
    recordCountEl.style.marginTop = "10px";

   
    
        const searchContainer = document.createElement("div");
        searchContainer.classList.add("search-container");
        searchContainer.style.display="flex"
        searchContainer.style.padding='5px'
        searchContainer.style.justifyContent='space-between';
        
       
        // date picker controls
        const startDate= document.createElement('input');
        startDate.type='date';
        startDate.style.width='200px';
        startDate.style.borderRadius='5px';
        startDate.style.margin='2px'
        startDate.addEventListener("change", this.handleStartDateChange.bind(this));
        startDate.value = this.startDate ? this.startDate.toISOString().substring(0, 10):''
        searchContainer.appendChild(startDate);
        
        
        const endDate = document.createElement('input');
        endDate.type='date'
        endDate.addEventListener("change", this.handleEndDateChange.bind(this));
        endDate.style.width='200px';
        endDate.style.borderRadius='5px';
        endDate.style.margin='2px'
        endDate.value = this.endDate ? this.endDate.toISOString().substring(0, 10):''
        searchContainer.appendChild(endDate);
        const searchBoxContainer= document.createElement('div');
        searchBoxContainer.classList.add('box');
        const inputEl = document.createElement("input");
        inputEl.type = "text";       
        inputEl.addEventListener("change", this.handlechange.bind(this));
        inputEl.addEventListener("input",this.searchChanged.bind(this));
        inputEl.classList.add('search-box');
        inputEl.placeholder='search..'
        inputEl.value=this.search;
    
        searchBoxContainer.appendChild(inputEl);
       

       
    
        searchContainer.appendChild(searchBoxContainer);
        tableContainer.appendChild(tableEl);
        this.container.appendChild(recordCountEl);
        this.container.appendChild(searchContainer);
        this.container.appendChild(tableContainer);
    }
    
    private handleStartDateChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.startDate = target.value ?  new Date(target.value) : null; 
      
        this.renderTable();
    }
    
    private handleEndDateChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.endDate = target.value ?  moment(target.value).toDate(): null;
      
        this.renderTable();
    }
    
    private recordMatchesSearch(record: DataSetInterfaces.EntityRecord, columns: DataSetInterfaces.Column[]): boolean {
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            const value = record.getFormattedValue(column.name);
            if (value.toLowerCase().indexOf(this.search.toLowerCase()) !== -1) {
                return true;
            }
        }
        return false;
    } 
   
    private searchChanged(e:Event):void{
        const target= e.target as HTMLInputElement;
        const inputValue = target.value;
  this.search = inputValue.trim();
  
  if (this.search === "") {
    this.renderTable();
    return;
  }

    }
    

    
    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }

}
