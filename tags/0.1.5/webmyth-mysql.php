<?php
# Original script from http://www.webos-internals.org/wiki/Tutorials_webOS_Getting_JSON_From_An_External_MySQL_Database
# Added modifications specifc to mythtv setup
#
# This file needs to be saved on a local webserver 
# On my system running Ubuntu 9.10 (Karmic) the file is saved in /var/www/ and is accessable as http://my-server/webmyth-mysql.php
# This files needs to be accesible without authentication on the webserver
# You need to change the hard coded values below to match your system
#
# You will also need to have a working copy of php installed on the server



header('Content-type: application/json');  // this is the magic that sets responseJSON

//Hard coded values
$dbhost = '192.168.1.105';
$dbuser = 'mythtv';
$dbpass = 'mythtv';
$dbname = 'mythconverg';

// Connecting, selecting database
$link = mysql_connect($dbhost, $dbuser, $dbpass)
    or die('Could not connect: ' . mysql_error());
    mysql_select_db($dbname) or die('Could not select database');
     
switch($_POST['op']) {
    case 'getAllRecords': {
            $table = $_POST['table'];
        $query = sprintf("SELECT * FROM %s", mysql_real_escape_string($table));
        // Performing SQL query
        $result = mysql_query($query) or die('Query failed: ' . mysql_error());
        $all_recs = array();
        while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
            $all_recs[] = $line;
	            }
		            break;
    }
    }

    echo json_encode($all_recs);

    // Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);
?>
