drop table locations, space_suits,transportation,trips,users,vaccines;

create table locations (
id serial primary key,
	location_name text,
	distance integer,
    unit_of_measure text
);

insert into locations(location_name, distance, unit_of_measure) values('North Mars', 168, 'million miles'),('East Mars', 172, 'million miles'),('South Mars', 156, 'million miles'),('West Mars', 189, 'million miles');

create table transportation (
id serial primary key,
	company_name text,
	price integer
);

insert into transportation (company_name,price) values ('SpaceX', 1200),('Virgin Galactic', 1000),('NASA',500);

create table trips (
	id serial primary key,
	departure_date date not null,
	arrival_date date not null,
	trip_time integer,
	location_id integer references locations,
	transportation_id integer references transportation
);

insert into trips (departure_date,arrival_date,trip_time, location_id) values ('2022-04-15', '2022-04-20', 120, 1),('2022-04-20', '2022-04-27', 168, 2),('2022-05-01', '2022-05-10', 240, 3),('2022-05-15', '2022-05-30', 360, 4);


create table space_suits (
id serial primary key,
	suit_name varchar(100) not null,
	suit_color varchar(100),
	temp_min integer,
	temp_max integer,
	suite_size text
);

insert into space_suits (suit_name, suit_color, temp_min, temp_max, suite_size) values ('Soft Suit', 'Sky Blue', 4,97, 'Medium'),('Hardshell Suit', 'White', 3,83, 'Medium'),('Hybrid Suit', 'Red', 5,89, 'Large'),('Skintight Suit', 'Black', 3,79, 'Small');


create table vaccines (
id serial primary key,
	vaccine_name text,
	location_id integer references locations
);

insert into vaccines (vaccine_name, location_id) values('Phobos Virus',1), ('Deimos Virus',2), ('Crimson Virus',3),('Quatro Virus',4);

create table users (
	id serial primary key,
	first_name varchar(100) not null,
	last_name varchar(100) not null,
	email varchar(100) not null,
	password varchar(200) not null,
	vaccine_compliant boolean, 
	trip_booked integer references trips
);

insert into users (first_name, last_name, email, password) values ('Ramiro', 'Lynch', 'ramiro@gmail.com', 'ramiropass');
insert into users (first_name, last_name, email, password) values ('Matt', 'Fanto', 'mfanto@gmail.com', 'mattpass');
insert into users (first_name, last_name, email, password) values ('Henry', 'Overholt', 'henry@gmail.com', 'henrypass');
insert into users (first_name, last_name, email, password) values ('Dana', 'Killeen', 'dana@gmail.com', 'danapass');
insert into users (first_name, last_name, email, password) values ('Sudha', 'Vallabhapurapu', 'sudha@gmail.com', 'sudhapass');
