package ru.avlasov.reverse;


import uml.java.reverser.ProgressTracing;

import java.util.logging.Logger;

public class LogProgressTracing implements ProgressTracing {
	private Logger log;

	public LogProgressTracing(Logger log) {
		this.log = log;
	}

	@Override
	public void outMessage(String message) {
		log.info(message);
	}

	@Override
	public void begin(String message, int size) {
		log.info(message + " [" + size + "] elements");
	}
	
	@Override
	public void step(int scale) {
	}

	@Override
	public void done() {
		log.info("Is done.");
	}
}
