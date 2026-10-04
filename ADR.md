# ADR 0001: Store-and-forward over persistent sockets

**Decision:** use Worker + KV and client polling.

**Reason:** two agents exchange low-volume text; a permanent socket adds battery, reconnect, and background-lifecycle complexity without improving the actual requirement. Reconsider for sub-second delivery or typing indicators.
