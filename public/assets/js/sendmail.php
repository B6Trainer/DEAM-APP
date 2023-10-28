<?php 
 
  if(isset($_POST['btn_submit']) && $_POST['btn_submit']=="submit")
  {

  	
  	$name=addslashes($_POST['name']);
	$phone=addslashes($_POST['phone']);
	$subject=addslashes($_POST['subject']);
	$email=addslashes($_POST['email']);
	$message=addslashes($_POST['message']);
	$to=$email;
	$from='utouchdesign07@gmail.com';
	$subject='contact-us';
	$mailcontent='<table>
	<tr><td colspan="2">Your data has been successfuly send:-</td></tr>
	<tr><td>Name:</td><td>'.$name.'</td></tr>
	<tr><td>Email:</td><td>'.$email.'</td></tr>
	<tr><td>Subject:</td><td>'.$subject.'</td></tr>
	<tr><td>Phone:</td><td>'.$phone.'</td></tr>
	<tr><td>Message:</td><td>'.$message.'</td></tr>
	<tr><td>&nbsp;</td><td>&nbsp;</td></tr>
	<tr><td colspan="2"><strong>Kind Regards,<br />
	UTOUCHDESIGN
	</strong></td></tr></table>';


	
	$headers = "MIME-Version: 1.0" . "\r\n";
	$headers .= "Content-type:text/html;charset=iso-8859-1" . "\r\n";
	$headers .= 'From: <'.$from.'>' . "\r\n";
	mail($to,$subject,$mailcontent,$headers);
	echo 'success';die;

  }
?>