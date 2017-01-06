<?php

require_once 'vendor/autoload.php';

use Smart\Data\Proxy;
use Smart\Setup\Start;

if(count($argv) == 1) {
	echo "... Favor informar os modulos para atualizacao!";
	return false;
}

$idx = 0;
$dns = Start::getConnnect();
$pwd = Start::getPassWord();
$usr = Start::getUserName();

$proxy = new Proxy(array($dns, $usr, $pwd), array('name'=>'build', 'path'=>'/'));

foreach ($argv as $name) {

	if($idx >= 1) {
		$classic = json_decode(file_get_contents("$name/classic.json"));
		$version = $classic->version;
		
		$sql = "
			declare
				@name varchar(20) = :name,
				@version varchar(20) = :version;

			update module set modulebuild = @version where name = @name;";	

		$pdo = $proxy->prepare($sql);
		$pdo->bindValue(":name", $name, \PDO::PARAM_STR);
		$pdo->bindValue(":version", $version, \PDO::PARAM_STR);
		$pdo->execute();
	}

	$idx++;

}

echo '... Atualizacao concluida com sussesso!';