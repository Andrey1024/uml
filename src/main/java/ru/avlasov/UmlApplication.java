package ru.avlasov;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import ru.avlasov.uml.Reverser;

@SpringBootApplication
public class UmlApplication {

	@Autowired
	private Reverser reverser;

	public static void main(String[] args) {
		SpringApplication.run(UmlApplication.class, args);
	}
}
