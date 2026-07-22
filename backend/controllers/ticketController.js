import Ticket from "../models/Ticket.js";

// Customers only see their own tickets; agents/admins see everything
export async function getAllTickets(req, res, next) {
  try {
    const filter = req.user.role === "customer" ? { createdBy: req.user._id } : {};

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email role");

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const isOwner = ticket.createdBy._id.equals(req.user._id);
    if (req.user.role === "customer" && !isOwner) {
      return res.status(403).json({ error: "Not authorized to view this ticket" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}

export async function createTicket(req, res, next) {
  try {
    const { title, description, priority, category } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      category,
      createdBy: req.user._id,
    });

    return res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}

// Customers may only update their own open tickets; agents/admins can update status, priority, assignee
export async function updateTicket(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const isOwner = ticket.createdBy.equals(req.user._id);

    if (req.user.role === "customer") {
      if (!isOwner) {
        return res.status(403).json({ error: "Not authorized to update this ticket" });
      }
      // Customers can only edit title/description, and only while still open
      if (ticket.status !== "open") {
        return res
          .status(400)
          .json({ error: "Ticket can no longer be edited once work has started" });
      }
      if (req.body.title) ticket.title = req.body.title;
      if (req.body.description) ticket.description = req.body.description;
    } else {
      // Agents/admins can update status, priority, category, assignedTo
      const { status, priority, category, assignedTo } = req.body;
      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (category) ticket.category = category;
      if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    }

    await ticket.save();
    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}

// Admin only
export async function deleteTicket(req, res, next) {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    return res.status(200).json({ message: "Ticket deleted" });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const isOwner = ticket.createdBy.equals(req.user._id);
    if (req.user.role === "customer" && !isOwner) {
      return res.status(403).json({ error: "Not authorized to comment on this ticket" });
    }

    ticket.comments.push({ author: req.user._id, text: req.body.text });
    await ticket.save();

    const updated = await Ticket.findById(ticket._id).populate(
      "comments.author",
      "name email role",
    );

    return res.status(201).json(updated.comments[updated.comments.length - 1]);
  } catch (error) {
    next(error);
  }
}
