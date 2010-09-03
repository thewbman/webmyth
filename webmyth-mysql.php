<?php
# Original script from http://www.webos-internals.org/wiki/Tutorials_webOS_Getting_JSON_From_An_External_MySQL_Database
# Heavily modified for use in WebMyth
#
# This file needs to be saved on a local webserver 
# On my system running Ubuntu 9.10 (Karmic) the file is saved in /var/www/ and is accessable as http://my-server/webmyth-mysql.php
# This files needs to be accesible without authentication on the webserver
# You need to change the hard coded values below to match your system
#
# You will also need to have a working copy of php installed on the server

header('Content-type: application/json');  // this is the magic that sets responseJSON
$script_version = 1;

//Default values if not set
if(isset($_POST['dbhost'])) $dbhost = $_POST['dbhost'];
    else $dbhost = '192.168.1.105';
if(isset($_POST['dbusr'])) $dbhost = $_POST['dbhost'];
    else $dbuser = 'mythtv';
if(isset($_POST['dbpass'])) $dbhost = $_POST['dbpass'];
    else $dbpass = 'mythtv';
if(isset($_POST['dbname'])) $dbname = $_POST['dbname'];
    else $dbname = 'mythconverg';


// Connecting, selecting database
switch($_POST['op']) {			//change back to POST
    
    case 'getScriptVersion': {
	$return_json = '{ "version": "'.$script_version.'" }';
	$use_mysql = false;
      break;
    }

    case 'getAllRecords': {
	$use_mysql = true;

	$table = $_POST['table'];		
	$query = sprintf("SELECT * FROM %s", $table);
      break;
    }

    case 'getRecorded'; {
        $use_mysql = true;
	$query = sprintf("SELECT recorded.*, channel.channum, channel.name FROM recorded, channel WHERE (recorded.chanid = channel.chanid)");
      break;
    }
    
    case 'getUpcoming': {
	$use_mysql = true;

	$query = sprintf("SELECT recordmatch.recordid, recordmatch.chanid, recordmatch.starttime, recordmatch.manualid, 
	                  recordmatch.oldrecduplicate, recordmatch.recduplicate, recordmatch.findduplicate, recordmatch.oldrecstatus, 
			  channel.channum, channel.name, program.* 
			  FROM recordmatch, program, channel 
			  WHERE ((recordmatch.chanid = program.chanid) AND (recordmatch.starttime = program.starttime) AND (recordmatch.chanid = channel.chanid));"
		);
      break;
    }
}

if($use_mysql) {
    $link = mysql_connect($dbhost, $dbuser, $dbpass)
    or die('Could not connect: ' . mysql_error());
    mysql_select_db($dbname) or die('Could not select database');
     
    // Performing SQL query
    $result = mysql_query($query) or die('Query failed: ' . mysql_error());
    $all_recs = array();
    
    while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
        $all_recs[] = $line;
    }

    mysql_free_result($result);
    mysql_close($link);

    $return_json = json_encode($all_recs);
}

echo $return_json;

?>
