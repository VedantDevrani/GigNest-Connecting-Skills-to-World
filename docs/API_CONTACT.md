================================================================================
                            GIGNEST — API CONTRACT
================================================================================

AUTH
----
POST /api/auth/register
POST /api/auth/login

USERS
-----
GET /api/users/:id
PUT /api/users/:id

JOBS
----
POST /api/jobs
GET /api/jobs
GET /api/jobs/:id
PUT /api/jobs/:id
DELETE /api/jobs/:id

PROPOSALS
---------
POST /api/proposals
GET /api/jobs/:id/proposals
PUT /api/proposals/:id/status

CONTRACTS
---------
POST /api/contracts
GET /api/contracts
PUT /api/contracts/:id/status

REVIEWS
-------
POST /api/reviews
GET /api/users/:id/reviews

MESSAGES
--------
POST /api/messages
GET /api/messages/:conversationId

PORTFOLIO
---------
POST /api/portfolio
GET /api/portfolio/:freelancerId
DELETE /api/portfolio/:id

NOTIFICATIONS
-------------
GET /api/notifications
PUT /api/notifications/:id/read

All protected routes require JWT token.

================================================================================
END OF API CONTRACT
================================================================================