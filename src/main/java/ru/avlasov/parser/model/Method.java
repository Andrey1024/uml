package ru.avlasov.parser.model;

import java.util.ArrayList;
import java.util.List;

public class Method extends Element {
    private String parentClass;
    private String returnType;
    private final List<String> parameterTypes = new ArrayList<>();

    public String getParentClass() {
        return parentClass;
    }

    public void setParentClass(String parentClass) {
        this.parentClass = parentClass;
    }

    public String getReturnType() {
        return returnType;
    }

    public void setReturnType(String returnType) {
        this.returnType = returnType;
    }

    public List<String> getParameterTypes() {
        return parameterTypes;
    }

    public Method() {
        super();
        setType("METHOD");
    }
}
