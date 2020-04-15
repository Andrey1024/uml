package ru.avlasov.ast;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.common.util.WrappedException;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.uml2.uml.Model;
import org.eclipse.uml2.uml.Package;
import org.eclipse.uml2.uml.UMLPackage;
import org.eclipse.uml2.uml.resource.UMLResource;
import org.eclipse.uml2.uml.resources.util.UMLResourcesUtil;

import java.io.FileNotFoundException;
import java.io.IOException;

public class ResourceUtil {
    public static void saveModel(Model model, String dir, String fileName) {
        // Create a resource-set to contain the resource(s) that we are saving
        ResourceSet resourceSet = new ResourceSetImpl();

        // Initialize registrations of resource factories, library models,
        // profiles, Ecore metadata, and other dependencies required for
        // serializing and working with UML resources. This is only necessary in
        // applications that are not hosted in the Eclipse platform run-time, in
        // which case these registrations are discovered automatically from
        // Eclipse extension points.
        UMLResourcesUtil.init(resourceSet);

        URI uri = URI
                .createFileURI(dir)
                .appendSegment(fileName)
                .appendFileExtension(UMLResource.FILE_EXTENSION);

        // Create the output resource and add our model package to it.
        Resource resource = resourceSet.createResource(uri);
        resource.getContents().add(model);

        // And save
        try {
            resource.save(null); // no save options needed
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }

    public static Model loadModel(String dir, String fileName) throws FileNotFoundException {
        URI uri = URI
                .createFileURI(dir)
                .appendSegment(fileName)
                .appendFileExtension(UMLResource.FILE_EXTENSION);

        ResourceSet resourceSet = new ResourceSetImpl();
        UMLResourcesUtil.init(resourceSet);
        resourceSet.createResource(uri);

        Model package_ = null;
        try {
            // Load the requested resource
            Resource resource = resourceSet.getResource(uri, true);

            // Get the first (should be only) package from it
            package_ = (Model) EcoreUtil.getObjectByType(resource.getContents(),
                    UMLPackage.Literals.MODEL);
        } catch (WrappedException we) {
            System.out.println(we.getMessage());
            return null;
        }

        return package_;
    }
}
