<?php
if(!empty($_POST['xmlStr'])){

$data = $_POST['xmlStr'];
$fname = mktime() . ".gpx";

debug_to_console("HELLO");
$doc = new DOMDocument();
$doc->formatOutput = true;
$doc->loadXML($data->asXML());

$doc->save("test.xml")

}
?>