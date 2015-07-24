package org.openmrs.module.muzimafingerPrint.web.controller;

import org.openmrs.Patient;
import org.openmrs.api.context.Context;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by archana on 7/14/15.
 */

@Controller
public class MuzimaFingerprintFindController {

    @RequestMapping(value = "module/muzimafingerPrint/findPatient1.form",  method = RequestMethod.GET)
    public void findPatient1(HttpServletRequest request, Model model)
    {
        //System.out.println("hello");
        if(request!=null) {
            System.out.println("In findPatient1 method: "+request.getParameter("message"));
            if(request.getParameter("message")!=null) {
                Patient pat = Context.getPatientService().getPatientByUuid(request.getParameter("message"));
                if(pat!=null) {
                    //System.out.println(pat.getPatientIdentifier(1));
                    model.addAttribute("mess", pat.getPatientIdentifier(1));
                }
            }
        }
    }
}
