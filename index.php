<?php
    $file = file_get_contents('./index.html',true);
    $api = $_ENV['APIURL'];
    echo str_replace("\${api}",$api,$file);
?>