package ru.avlasov.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AngularRoutesController {

    @RequestMapping("/repository/**")
    public String index() {
        return "forward:/index.html";
    }
}
