
ALTER TABLE species ADD COLUMN IF NOT EXISTS continent text;

UPDATE species SET continent = 'North America' WHERE common_name IN ('Red Fox', 'White-Tailed Deer', 'Raccoon', 'Squirrel', 'Rattlesnake', 'Polar Bear');
UPDATE species SET continent = 'Europe'        WHERE common_name IN ('Sparrow', 'Pigeon', 'Hedgehog');
UPDATE species SET continent = 'South America' WHERE common_name = 'Frog';
UPDATE species SET continent = 'Asia'          WHERE common_name = 'Albino Deer';
UPDATE species SET continent = 'Antarctica'    WHERE common_name = 'Penguin';
