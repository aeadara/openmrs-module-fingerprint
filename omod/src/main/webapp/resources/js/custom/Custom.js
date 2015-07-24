
var _FINGERPRINT_DATA = "";
var PATIENT_UUID = "";

function showMessage() {
    return "This is from javascript";
};

function identifyPatient(fingerprintData){

    _FINGERPRINT_DATA = fingerprintData;
    var xmlhttp;
    var data = 'no data found';
    if (window.XMLHttpRequest) {
        xmlhttp=new XMLHttpRequest();
    }
    else {
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            data = xmlhttp.responseText;
            console.log(data);
            var data1 = JSON.parse(data);
            var dataArr = [];
            dataArr.push(data1);
            updatePatientListTable(dataArr, 1);
        }
    }
    xmlhttp.open("POST","fingerprint/identifyPatient.form",false);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.setRequestHeader("Accept","application/json");
    xmlhttp.send(fingerprintData);

    return "[" + data + "]";

};

function updatePatientListTable(Patients, updateControlsStatus){

    updateControls(updateControlsStatus);
    $("#tblData tbody tr").remove();
    Patients.forEach( function (patient){
        var selectionColumn = "";
        /*if(updateControlsStatus == 5){
         selectionColumn =  "<td><input type='radio' name='selectedPatient' value = '"+patient.patientUUID+"'> "+patient.id+"</td>";
         }
         else{
         selectionColumn =  "<td><a href='"+openmrsContextPath+"/patientDashboard.form?patientId="+patient.id+"'>"+patient.id+" </a></td>";
         }*/
        selectionColumn =  "<td><a href='"+openmrsContextPath+"/patientDashboard.form?patientId="+patient.id+"'>"+patient.id+" </a></td>";
        $("#tblData tbody").append( "<tr>"
            + selectionColumn
            + "<td>"+patient.givenName +"</td>"
            + "<td>"+ patient.familyName+"</td>"
            + "<td>"+ patient.gender+"</td>"
            + "<td>"+show(patient.fingerprintTemplate,patient.patientUUID)+"</td>"
            + "</tr>");
    });
};

function activate(val, e){
    var key=e.keyCode || e.which;
    if (key==13){
        //alert("hello "+val);
        //$.post("fingerprint/findPatients.form", val, function(){ });
        $.ajax({
            type: "POST",
            url: "fingerprint/findPatients.form",
            contentType: "application/json",
            data: val,
            dataType: 'json',
            success: function (result) {
                //alert('Yay! It worked!');
                console.log(result);
                updatePatientListTable(result, 5);
            },
            error: function (result) {
                alert('Oh no :(');
            }
        });
    }
}

function show(fingerprint, patientUuid){
    if(fingerprint!==null) {
        return "<img src ='"+openmrsContextPath+"/moduleResources/muzimafingerPrint/images/done.png'/>"
    }
    else {
        return "<input id = 'addFingerprint' type='button' value= 'Add fingerprint' class='addFingerprintButton' onClick='addFPrint(\""+patientUuid+"\")'/>"
    }
};

function addFPrint(patientUuid){
    /*$('#addFingerprint'+patientUuid).hide();
     $('#tester').show();*/
    PATIENT_UUID = patientUuid;
    window.location = openmrsContextPath+'/module/muzimafingerPrint/newPage.form?patUuid='+patientUuid;
};

function RegisterPatient(fingerprint){
    updateControls(2);
    /*var elm_reg = document.getElementById('fingerprint');
    elm_reg.value = fingerprint;*/
};

function updateControls(status){
    if(status==0){

        //Hiding all the section -- case0 : loading time
        $('#body-wrapper').hide();
        $('#otherIdentificationOption').hide();
        $('#otherIdentifiers').hide();
        $('#registrationForm').hide();
        $('#updatePatient').hide();

    }else if(status ==1){

        //Show table - case1 : Patient found for scan process
        $('#body-wrapper').show();
        $('#otherIdentificationOption').hide();
        $('#otherIdentifiers').hide();
        $('#registrationForm').hide();
        $('#updatePatient').hide();

    }else if(status ==2){

        //Show other option - case2 : Patient not found
        $('#body-wrapper').hide();
        $('#otherIdentificationOption').show();
        $('#otherIdentifiers').hide();
        $('#registrationForm').hide();
        $('#updatePatient').hide();
    } else if(status ==3){

        //Show other identifiers section - case3 : clicked yes
        $('#body-wrapper').hide();
        $('#otherIdentificationOption').hide();
        $('#otherIdentifiers').show();
        $('#registrationForm').hide();
        $('#updatePatient').hide();
    } else if(status ==4){

        //Show registration section - case4 : clicked No
        $('#body-wrapper').hide();
        $('#otherIdentificationOption').hide();
        $('#otherIdentifiers').hide();
        $('#registrationForm').show();
        $('#updatePatient').hide();
    }
    else if(status ==5){
        //Show table - case1 : Patient found for other identifier
        $('#body-wrapper').show();
        $('#otherIdentificationOption').hide();
        $('#otherIdentifiers').hide();
        $('#registrationForm').hide();
        $('#updatePatient').hide();

    }

};

var pushIntoArray = function (object, key, value) {
    if (JSON.stringify(value) == '{}' || value == "") {
        return object;
    }
    if (object[key] !== undefined) {
        if (!object[key].push) {
            object[key] = [object[key]];
        }
        object[key].push(value || '');
    } else {
        object[key] = value || '';
    }
    return object;
};

var serializeNonConceptElements = function ($form) {
    var object = {};
    var $inputElements = $form.find('[name]').not('[data-concept]');
    $.each($inputElements, function (i, element) {
        if ($(element).is(':checkbox') || $(element).is(':radio')) {
            if ($(element).is(':checked')) {
                object = pushIntoArray(object, $(element).attr('name'), $(element).val());
            }
        } else {
            object = pushIntoArray(object, $(element).attr('name'), $(element).val());
        }
    });
    return object;
};
$.fn.serializeEncounterForm = function () {
    var jsonResult = $.extend({}, serializeNonConceptElements(this));
    var completeObject = {};
    var defaultKey = "patient";
    $.each(jsonResult, function (k, v) {
        var key = defaultKey;
        var dotIndex = k.indexOf(".");
        if (dotIndex >= 0) {
            key = k.substr(0, k.indexOf("."));
        }
        var objects = completeObject[key];
        if (objects === undefined) {
            objects = {};
            completeObject[key] = objects;
        }
        objects[k] = v;
    });
    return completeObject;
};


$(function(){
    $.ajax({
            url: "../../ws/rest/v1/location",
            type: "GET",
            async: true,
            success: function(result) {

                var options = $("#LocationOptions");
                $.each(result.results, function(val, text) {
                    options.append($("<option />").val(text.uuid).text(text.display));
                });
            },
            error: function(msg){
                alert("Internal server error : while getting location list ");
            }
        }
    );
    $.ajax({
            url: "../../ws/rest/v1/user",
            type: "GET",
            async: true,
            success: function(result) {
                var options = $("#ProviderOptions");
                $.each(result.results,  function(val, text) {
                    options.append($("<option />").val(text.uuid).text(text.display));
                });
            },
            error: function(msg){
                alert("Internal server error : while getting provider list ");
            }
        }
    );

    $.ajax({
            url: "../../ws/rest/v1/patientidentifiertype",
            type: "GET",
            async: true,
            success: function(result) {

                var options = $("#IdentifierOptions");
                $.each(result.results, function(val, text) {
                    options.append($("<option />").val(text.uuid).text(text.display));
                });
            },
            error: function(msg){
                alert("Internal server error : while getting Identifier list ");
            }
        }
    );

    $("#btnByIdentifier").click(function(){
        var jsonData = JSON.stringify($('#IdentifierForm').serializeEncounterForm());
        console.log(jsonData);
        $.ajax({
            url: "fingerprint/identifyPatientByOtherIdentifier.form",
            type: "POST",
            data: jsonData,
            contentType: 'application/json',
            dataType: 'json',
            async: false,
            success: function(msg) {
                console.log(msg);
                updatePatientListTable(msg, 5);
            },
            error: function(msg, status, error){
                alert(error);
            }
        });

    });
    $("#btnYes").click(function(){
        updateControls(4);
    });
    $("#btnNo").click(function(){
        updateControls(0);
    });
    $("#Yes").click(function(){
        var patientUuid = $('#uid').val();
        var jsonData = "{patient: {patientUUID : '"+patientUuid+"' , fingerprint :'"+ _FINGERPRINT_DATA+"'}}";
        console.log(jsonData);
        $.ajax({
            url: "fingerprint/addFingerprint.form",
            type: "POST",
            data: jsonData,
            contentType: 'application/json',
            dataType: 'json',
            async: false,
            success: function(msg) {
                console.log(msg);
                window.location = openmrsContextPath+'/module/muzimafingerPrint/findPatient1.form?message='+patientUuid;
                //updatePatientListTable(message, 5);
            },
            error: function(msg, status, error){
                alert(error);
            }
        });
    });
    $("#No").click(function(){
        updateControls(0);
        window.location = openmrsContextPath+'/module/muzimafingerPrint/findPatient1.form';
    });
    $(".doCancel").click(function(){
        updateControls(4);
    });
    $("#btnUpdatePatient").click(function(){
        var selectedPatientId = $('input[name=selectedPatient]:checked').val();
        var jsonData = "{patient: {patientUUID : '"+selectedPatientId+"' , fingerprint :'"+ _FINGERPRINT_DATA+"'}}";
        $.ajax({
            url: "fingerprint/UpdatePatientWithFingerprint.form",
            type: "POST",
            data: jsonData,
            contentType: 'application/json',
            dataType: 'json',
            async: false,
            success: function(msg) {
                alert("Patient updated!");
                updateControls(0);
            },
            error: function(msg, status, error){
                console.log(msg);
                alert(error);
            }
        });

    });

    $("#btnCreatePatient").click(function(){
        if($("#formData").valid()){
            var jsonData = JSON.stringify($('#formData').serializeEncounterForm());
            $.ajax({
                url: "fingerprint/register.form",
                type: "POST",
                data: jsonData,
                contentType: 'application/json',
                dataType: 'json',
                async: false,
                success: function(msg) {
                    alert("Patient Created!");
                    $('#formData').trigger("reset");
                    updatePatientListTable(msg, 1);
                },
                error: function(msg, status, error){
                    console.log(msg);
                    alert(error);
                }
            });
        }
    });

    $.validator.addMethod("checkDigit", function (value, element) {
            var num = value.split('-');
            if (num.length != 2) {
                return false;
            }
            return $.fn.luhnCheckDigit(num[0]) == num[1];
        }, "Please enter digits that matches CheckDigit algorithm."
    );

    $.validator.addMethod("nonFutureDate",
        function (value, element) { return Date.parse(value.replace("-","/")) < new Date().getTime(); },
        "Date can not be in the future."
    );

    $.fn.luhnCheckDigit = function (number) {
        var validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVYWXZ_";
        number = number.toUpperCase().trim();
        var sum = 0;
        for (var i = 0; i < number.length; i++) {
            var ch = number.charAt(number.length - i - 1);
            if (validChars.indexOf(ch) < 0) {
                return false;
            }
            var digit = ch.charCodeAt(0) - 48;
            var weight;
            if (i % 2 == 0) {
                weight = (2 * digit) - parseInt(digit / 5) * 9;
            }
            else {
                weight = digit;
            }
            sum += weight;
        }
        sum = Math.abs(sum) + 10;
        return (10 - (sum % 10)) % 10;
    };

    $('#formData').validate({
        rules :{
            family_name : {
                required : true
            },
            given_name : {
                required : true
            },
            middle_name:{

            },
            sex :{
                required : true
            },
            phone_number :{

            },
            amrs_id : {
                required : true,
                checkDigit: true
            },
            fingerprint:{
                required : true
            },
            birth_date :{
                required : true,
                nonFutureDate: true

            },
            location_id:{
                required : true
            },
            provider_id : {
                required : true
            },
            encounter_datetime:{
                required : true,
                nonFutureDate: true
            }
        }
    });
    /*$("#findPatients").onkeydown( function(event) {
     var message = $('#findPatients').val();
     if(event.keyCode==13){
     $.post("fingerprint/findPatients.form", message, function(){ });
     }
     });*/
    /*var newMessage = $('#mes').val();
    //alert("newMessage is ----"+newMessage+"----");
    if(newMessage != null && newMessage !='')
    {
        updatePatientListTable(newMessage, 5);
    }*/
    updateControls(0);
    if($("#findPatients").val() != null && $("#findPatients").val() != "")
    {
        $.ajax({
            type: "POST",
            url: "fingerprint/findPatients.form",
            contentType: "application/json",
            data: $("#findPatients").val(),
            dataType: 'json',
            success: function (result) {
                //alert('Yay! It worked!');
                console.log(result);
                updatePatientListTable(result, 5);
            },
            error: function (result) {
                alert('Oh no :(');
            }
        });
    }
});