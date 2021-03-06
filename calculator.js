//before upload to heroku delete local from formatNumber function

const express = require('./node_modules/express');
const app = express();

//middleware
const morgan = require('./node_modules/morgan');
const bodyParser = require('./node_modules/body-parser');
const cors = require('./node_modules/cors/lib');
const loki = require('lokijs');

app.use(bodyParser.urlencoded({extended: false})) //middleware to process request easier


app.use(express.static('../websiteWithNodeJs/'))//allows .html to work locally 


app.use(morgan('short')) //combined or short options
app.use(cors())//enables all cors requests

// define the server PORT
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Listening on port " + port + " ...");
});

//testing endpoints
app.get("/", (req,res) => {
    console.log("Responding to root route")
    res.send('Hello from calculator app')
})

//wake up post
app.post('/wake-up', (req, res) => {
	const status = req.body.state;
	console.log("someone woke me up by chanting : " + status);	
	//sends back
	res.status(200).send({ 
		state: "I am awake"});

res.end();
});


//rocket elevator specific variables
var floorsPerColumn = 20;
var standardPrice = 7565 , premiumPrice = 12345 , exceliumPrice = 15400; 
var standardFee  = 10 , premiumFee = 13 , exceliumFee = 16;


//global variables used in the program:
var type, appartements, stories, buisness, companies,basements, parking, occupants, cages, activity, columns, shafts, elevators, floors, elevatorsPerColumn, elevators;
//receives the post
app.post('/building-config', (req, res) => {
    	    //row1 variables
			 type = req.body.type;
			 appartements = parseInt(req.body.appartements);
			 buisness = parseInt(req.body.buisness);
			 companies = parseInt(req.body.companies);
			 stories = parseInt(req.body.floors);
			
			//row2 variables
			 basements = parseInt(req.body.basements);
			 parking = parseInt(req.body.parking);
			 occupants = parseInt(req.body.occupants);
			 cages = parseInt(req.body.cages);
			 activity = parseInt(req.body.activity);
			//row3 variables
			 columns = parseInt(req.body.columns);
			 shafts = parseInt(req.body.shafts);
             elevators = parseInt(req.body.elevators);
            calculator();
			//console.log(selectedLine +"is selected")
			calculateCosts();
            //console.log("testing ... shafts = " + shafts);
			
			//sends back
			res.status(200).send({ 
				shafts: shafts, 
				columns: columns, 
				elevatorsPerColumn: elevatorsPerColumn, 
				elevators: elevators});

    res.end();
});

var selectedLine, pricePerShaft, totalMat, feePercent, fee, total, totalMatString,  feeString, pricePerShaftString, totalString;
app.post('/line-selection', (req,res) => {
	//variables to work with
	shafts = parseInt(req.body.shafts);
	selectedLine = req.body.selectedLine;
	//console.log("test received : shafts = "+ shafts+ " line = "+ selectedLine);	
	//function to be run before callback
	calculateCosts();
	//callback (send)
	res.status(200).send({ //data to be sent as key: value,...
		totalMatString: totalMatString,
		feePercent: feePercent,
		pricePerShaftString: pricePerShaftString,
		feeString: feeString,
		totalString:totalString	});

	res.end()
});


function calculateCosts(){
	//define prices dependant on the line
	if (selectedLine === "standard"){
		//feepercent is 10
		feePercent = standardFee;
		pricePerShaft = standardPrice;
	}
	//if premium is selected
else if (selectedLine === "premium"){
		//feePercent is 13
		feePercent = premiumFee;
		pricePerShaft = premiumPrice;
	}
	//if excelium is selected
else if (selectedLine === "excelium"){
		//feePercent is 16
		feePercent = exceliumFee;
		pricePerShaft = exceliumPrice;
}else {return;}

totalMat = shafts * pricePerShaft;
fee = Math.round((feePercent/100 * shafts * pricePerShaft) * 100) / 100;
total = (totalMat) + fee;
	console.log("total = "+ total)	

//stringify results xxx,xxx,xxx.xx
totalMatString = formatNumber(totalMat);
pricePerShaftString = formatNumber(pricePerShaft); 
feeString = formatNumber(fee);
totalString = formatNumber(total);

};

var formatNumber = function(x){
	x = x.toFixed(2);
	 return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');//+"local";
};


function numberColumns(){
	columns = 1 + Math.floor(stories / floorsPerColumn);
};

var logVariables = function(){
	console.log("row1 : "+"type "+ type + ", apt " + appartements +", buisnesses "+ buisness + ', companies '+ companies + ', floors '+ floors);
	console.log( "row2 : "+" basements "+ basements + ", parking "+ parking + ", occupants " + occupants + ", cages "+ cages+ ", activity" + activity);
	console.log("row3 : "+"columns "+ columns + ", shafts/cages/elevators "+ shafts + ", temporary elevator value" + elevators);
	console.log("final form : "+ selectedLine+ ", total Material "+ totalMat + ", installation fee" + fee );
	console.log("TOTAL : " + total);

	};



function calculator(){
	floors = stories - basements;

	if (type === 'residential'){
		resCalc();

	}else if(type === "corporate"){
		corpHybCalc();
		
	}else if (type === "commercial"){
		comCalc();

	}else if(type === "hybrid"){
		corpHybCalc();
	}else {
		return;
	}



};

//calculator for a residential building
function resCalc(){
	//calculate average doors per floor (appartements/floors) 
	var avgDoors = Math.ceil(appartements / floors);
	//calculate number of columns ( 1 + (floors/floorsPerColumn))
	numberColumns();
	//calculate number of shafts 1 for 6 appartments *columns
	shafts = Math.ceil(avgDoors / 6 ) * columns;
	
	//logVariables();
};

//calculator for corporate and hybrid buildings
var corpHybCalc = function(){
	//calculate total number of occupants ((floors+basements)*occupants)
	var totalOccupants = occupants * (floors+basements);
	//number of elevators (totalOccupants/1000)
	elevators = Math.ceil(totalOccupants / 1000); 
	
	//number of columns ((floors+basements)/FloorsPerColumn)
		 numberColumns();
	//number of elevators per column ([elevators|shafts]/columns)
	elevatorsPerColumn = Math.ceil(elevators / columns);
	
	//calculate total number of elevators (elevatorsPerColumn*columns)
	shafts = elevatorsPerColumn * columns;
	
	//logVariables();

};

//commercial calculator function
var comCalc = function(){
	shafts = cages ;
	//logVariables();

};

//using the loki database

var db = new loki('projects.json',{
    autoload: true,
    autoloadCallback: loadHandler,
    autosave: false,
    //autosaveInterval: 10000
});

//load Database from file
function loadHandler() {
// if database did not exist it will be empty so I will intitialize here

};
console.log(db);

var testcollection = db.addCollection("testCollection")
var test = testcollection.insert ({name:"john"});
testcollection.insert({name: "testing"})

console.log(db);
console.log(testcollection.data);



// saveproject post
app.post('/save-project', (req, res) => {

	 		const projectName =  req.body.projectName;
			//row1
			var tenants =  req.body.tenants;
			const floors =  req.body.floors;
			const type =  req.body.type;
			//row2 variables
			const basements =  req.body.basements;
			const parking =  req.body.parking;
			const occupants =  req.body.occupants;
			const cages =  req.body.cages;
			const activity =  req.body.activity;

			const line = req.body.line;
			//row3 variables
			const columns =  req.body.columns;
			const shafts =  req.body.shafts;
			const elevators =  req.body.elevators;
			//totals
			const totalMat =  req.body.totalMatString;
			const fee =  req.body.feeString;
			const total =  req.body.totalString;


	console.log("received");
	console.log(projectName);
     //add to db
   var projects = db.addCollection('projects');
   var project = projects.insert({
		name: projectName,
		//row1
		tenants: tenants,
		floors: floors,
		type: type,
		//row2 variables
		basements : basements,
		parking : parking,
		occupants : occupants,
		cages : cages,
		activity : activity,

		//row3 variables

		columns : columns,
		shafts : shafts,
		elevators: elevators,
		//totals
		line : line,
		totalMat: totalMat,
		fee: fee,
		total: total
	});
   
	console.log(project.name);
  	var doc = projects.get(project.$loki)
   
  
   
   	console.log (projects.data);
	console.log(doc.$loki);
   //console.log(db);

	   
	   //test de commande je veux le document $loki 25
  
	   var docu = projects.findOne({$loki:1});
	   console.log("searched document is : ");
	   console.log(docu.name);

  db.saveDatabase();



   //sends the $loki id number of saved project
   res.status(200).send({  projectNumber: doc.$loki});
   res.end()
});

//load a project post
app.post("/load-project", (req, res) => {
    
	const loki = parseInt(req.body.loki);
	console.log("recieved");
	console.log(loki);
    
	var projects = db.addCollection('projects');


     var found = projects.findOne({$loki: loki});
        console.log("found document is : ");
		console.log(found);
		console.log (found.type);

    

 //sends the result of findOne
	res.status(200).send({ 
		name: found.name,
		$loki: found.$loki,
		//row1
		tenants: found.tenants,
		floors: found.floors,
		type: found.type,
		//row2 variables
		basements : found.basements,
		parking : found.parking,
		occupants : found.occupants,
		cages : found.cages,
		activity : found.activity,

		//row3 variables
		columns : found.columns,
		shafts : found.shafts,
		elevators: found.elevators,
		//totals
		line: found.line,
		totalMat: found.totalMat,
		fee: found.fee,
		total: found.total

	});
    res.end()
})


