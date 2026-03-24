================================================================================
                            GIGNEST — DATABASE SCHEMA
================================================================================

Users
-----
id (Primary Key)
name
email (Unique)
password
role (CLIENT, FREELANCER)
bio
hourlyRate
availabilityStatus (AVAILABLE, BUSY, OFFLINE)
createdAt

Jobs
----
id (Primary Key)
title
description
budget
deadline
skills (array or relation)
clientId (Foreign Key → Users.id)
status (OPEN, CLOSED)
createdAt

Proposals
---------
id (Primary Key)
jobId (FK → Jobs.id)
freelancerId (FK → Users.id)
coverLetter
bidAmount
status (PENDING, ACCEPTED, REJECTED)
createdAt

Contracts
---------
id (Primary Key)
jobId (FK)
clientId (FK)
freelancerId (FK)
status (ONGOING, COMPLETED)
paymentStatus (UNPAID, PAID)
createdAt

Reviews
-------
id (Primary Key)
contractId (FK)
reviewerId (FK)
reviewedUserId (FK)
rating (1–5)
comment
createdAt

Messages
--------
id (Primary Key)
senderId (FK)
receiverId (FK)
message
createdAt

Portfolio
---------
id (Primary Key)
freelancerId (FK)
title
description
projectLink
createdAt

SavedJobs
---------
id (Primary Key)
userId (FK)
jobId (FK)

Notifications
-------------
id (Primary Key)
userId (FK)
type
message
isRead (Boolean)
createdAt

================================================================================
END OF DATABASE SCHEMA
================================================================================