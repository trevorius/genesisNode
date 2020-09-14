const express = require('./node_modules/express');
const app = express();

//middleware
const morgan = require('./node_modules/morgan');
const bodyParser = require('./node_modules/body-parser');
const cors = require('./node_modules/cors/lib');

app.use(bodyParser.urlencoded({extended: false})) //middleware to process request easier
app.use(express.static('../'))//allows .html to work locally 
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
	 return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

function calcCom(){

return cages

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
