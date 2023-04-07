require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));


/************************************************************************************ 
 * mongoDB Setup
*************************************************************************************/
const url = "mongodb+srv://candy:" + process.env.MONGO_PASSWORD + "@cluster0.q3nwv.mongodb.net/trainDB";
mongoose.connect(url, {useNewUrlParser: true}); 


/************************************************************************************ 
 * Creating schemas
*************************************************************************************/
//This is train seat schema
const seatSchema = new mongoose.Schema({
    seatNumber: Number,
    isBooked: Boolean,
    updated: { type: Date, default: Date.now }
});
const Seat = new mongoose.model('Seat', seatSchema);

//This is train schema
const trainSchema = new mongoose.Schema({
    name: String,
    trainNumber: {
        type: String,
        unique: true
    },
    seats: [seatSchema]
});
const Train = new mongoose.model('Train', trainSchema);





/************************************************************************************ 
 * Handling Routes
*************************************************************************************/

/* This is book seats route, which takes input form user as number of seats.
*  Then the number of seats are booked in post request of /book  */
app.get('/', function(req, res) {
    Train.find({}).then(foundTrains => {
        const train = foundTrains[0];

        //filtering through seats to find unreserved seats to diaplay at frontend
        let nonReservedSeats = train.seats.filter((seat) => {
            return !seat.isBooked;
        });

        res.render('booking', {availableSeats: nonReservedSeats.length, trainName: train.name, trainNumber: train.trainNumber});
    });
    
});


/* Route to view a train and its coaches, it takes trainNumber as path param and finds the
   train using that param-> trainNumber   */
app.get('/train/:trainNumber', function(req, res) {
    const trainNumber = req.params.trainNumber;

    Train.find({}).then(async foundTrains => {

        //finding train using train number
        let trainIdx = foundTrains.findIndex(t => {
            return t.trainNumber === trainNumber;
        });

        res.render('train', {train: foundTrains[trainIdx],  seats: foundTrains[trainIdx].seats, booking: false, bookedSeats: [-1]});
    });
    

});


//This route is reserving/un-reserving some seats
app.get('/book-some-seats/:trainNumber', function(req, res) {
    const trainNumber = req.params.trainNumber;

    Train.find({}).then(async foundTrains => {

        //finding train using train number
        let trainIdx = foundTrains.findIndex(t => {
            return t.trainNumber === trainNumber;
        });

        let seats = foundTrains[trainIdx].seats;
        const seatsToBook = [56, 57, 58, 59, 60, 61, 62, 49, 50, 51, 52, 35, 36, 37, 38, 39];
        const seatsTounBook = [7, 8, 9, 13]
        seats.forEach(s => {
            seatsToBook.forEach(sn => {
                if(s.seatNumber === sn) {
                    s.isBooked = true;
                }
            });
            seatsTounBook.forEach(sn => {
                if(s.seatNumber === sn) {
                    s.isBooked = false;
                }
            });
        });


        foundTrains[trainIdx].save();

        res.redirect('/train/' + trainNumber);
    });
});


/* This Route is creating a train with single coach having 80 seats.
*  Created first train using this route  */
app.get('/create', function(req, res) {
    const trainSeats = [];
    for(let i = 0; i < 80; i++) {
        const seat = new Seat({
            seatNumber: i,
            isBooked: false,
        });
        trainSeats.push(seat);
    }

    const train = new Train({
        name: 'Unstop Express',
        trainNumber: '123456',
        seats: trainSeats
    });

    train.save();

    res.send('Seats Created');
});


/*
 * This is booking route, it get number of seats in post request with train number
 * Using train number and number of seats it books seats in that train
 */
app.post('/book', function(req, res) {
    let availableTrainSeats = parseInt(req.body.availableSeats);
    let userSeatsCount = parseInt(req.body.seatsCount);
    let trainNumber = req.body.trainNumber;   

    //if user required seats count is greater then available seats then return
    if(userSeatsCount > availableTrainSeats || userSeatsCount == 0) {
        res.send('There are no seats available, try other trains.');
        return;
    }


    Train.find({}).then(async foundTrains => {

        //finding train using train number
        let trainIdx = foundTrains.findIndex(t => {
            return t.trainNumber === trainNumber;
        });

        let seats = foundTrains[trainIdx].seats;
        let connectedSeats = getAvailableSeats(seats, userSeatsCount);
        
        //connectedSeats is an array of seats-number which can be booked EX- [0, 1, 2, 3, 4]
        //now booking those seats
        seats.forEach(s => {
            connectedSeats.forEach(sn => {
                if(s.seatNumber === sn) {
                    s.isBooked = true;
                }
            });
        });


        foundTrains[trainIdx].save(); //saving to DB

        //adding seats in arr to display at frontend
        //In fronted the seats color are differentiated on the basis of status of seat
        // V means either booked or Vacant
        //U means this is the seat booked for user
        let temp = [];
        seats.forEach(s => {
            let dummySeat = {
                seatNumber: s.seatNumber,
                isBooked: s.isBooked,
                status: 'v'
            }
            connectedSeats.forEach(sn => {
                if(s.seatNumber === sn) {
                    dummySeat.status = 'U'
                }
            });

            temp.push(dummySeat);
        });

        res.render('train', {train: foundTrains[trainIdx], seats: temp, booking: true, bookedSeats: connectedSeats});
    });
    
});







/************************************************************************************ 
 * Book Seats Algorithm
 * Function - getAvailableSeats(seats-> Train Seats, userSeatsCount-> user requested no. of seats)
*************************************************************************************/
function getAvailableSeats(seats, userSeatsCount) {
    //creating a 2-D array to visualise seats in form of Graph
    let seatsMatrix = [];
    let seatNumber = 0;
    for(let i = 0; i < 12; i++) {
        let seatsRow = [];
        
        for(let j = 0; j < 7; j++) {
            const currSeat = seats[seatNumber++];
            let dummySeat = {
                seatNumber: seatNumber,
                isBooked: true,
            };
            if(currSeat) {
                dummySeat = {
                    seatNumber: currSeat.seatNumber,
                    isBooked: currSeat.isBooked
                }
            }
            seatsRow.push(dummySeat);
        } 
        
        seatsMatrix.push(seatsRow);
    }

    //checking if can book a row as priority
    //if row is available to book then return the row seat numbers
    for(let i = 0; i < 12; i++) {
        let unReservedSeats = [];
        for(let j = 0; j < 7; j++) {
            if(!seatsMatrix[i][j].isBooked) {
                unReservedSeats.push(seatsMatrix[i][j].seatNumber);

                if(unReservedSeats.length >= userSeatsCount) return unReservedSeats;
            }else break;
        }
    }

    //using recursion finding connected seats, if found required connected seats then return
    let connectedSeatComponents = []; // it will store all connected seats
    for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 7; j++) {
            if(!seatsMatrix[i][j].isBooked) {
                connectedSeats = [];
                getConnectedSeats(seatsMatrix, i, j, userSeatsCount);
                if(connectedSeats.length >= userSeatsCount) return connectedSeats;
                connectedSeatComponents.push(connectedSeats);
            }
        }
    }


    //Now it is the case when row is not available to book and when connected seats is less than req. seats
    //Sorting connected seats componenets on the basis of their length in DESC order
    //Sorting will help us to arrange componets having max. seats connected to book
    connectedSeatComponents.sort(function(a, b){return b.length - a.length});
    let unReservedSeats = [];

    //Iterating through the connectedSeatComponents and adding seats in unReservedSeats
    //When unReservedSeats.length == required seats length then return
    for(let i = 0; i < connectedSeatComponents.length; i++) {
        for(let j = 0; j < connectedSeatComponents[i].length; j++) {
            unReservedSeats.push(connectedSeatComponents[i][j]);
            if(unReservedSeats.length >= userSeatsCount) return unReservedSeats;
        }
    }
    return [];
}

//Global Variable used to store a set of connected seats
let connectedSeats = [];

/************************************
 * Function - getConnectedSeats() it finds the nearest empty seats in left or right or top or bottom
 * ************************************ */
function getConnectedSeats(seatsMatrix, i, j, userSeatsCount) {
    if(i < 0 || j < 0 || i > 11 || j > 6 || seatsMatrix[i][j].isBooked || connectedSeats.length >= userSeatsCount) 
        return;

    connectedSeats.push(seatsMatrix[i][j].seatNumber);
    seatsMatrix[i][j].isBooked = true;

    getConnectedSeats(seatsMatrix, i, j-1, userSeatsCount);
    getConnectedSeats(seatsMatrix, i, j+1, userSeatsCount);
    getConnectedSeats(seatsMatrix, i-1, j, userSeatsCount);
    getConnectedSeats(seatsMatrix, i+1, j, userSeatsCount);
}




let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}
app.listen(port, function(req, res){
    console.log('Server is running');
});
  